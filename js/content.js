// content.js - MorphAgent 4.1.0
// Inject stealth scripts into the page context immediately to override native methods.

(function() {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  // Retrieve settings and initialize stealth suite
  api.storage.local.get([
    'selectedUA',
    'uaSpoofEnabled',
    'touchSpoofEnabled',
    'maxTouchPoints',
    'jsBlockEnabled',
    'jsProtectEnabled',
    'activeCategory',
    'geoSpoofEnabled',
    'geoCoords'
  ]).then((settings) => {
    api.storage.sync.get(['blockList', 'listMode', 'websiteRules']).then((syncResult) => {
      const blockList = syncResult.blockList || [];
      const listMode = syncResult.listMode || 'blacklist';
      const websiteRules = syncResult.websiteRules || [];
      const currentHostname = window.location.hostname;

      // Check blockList / whitelist mode
      let inList = false;
      for (const blockItem of blockList) {
        const pattern = blockItem.website.replace(/\*/g, '');
        if (currentHostname.includes(pattern)) {
          inList = true;
          break;
        }
      }

      let shouldSpoof = true;
      if (listMode === 'blacklist' && inList) {
        shouldSpoof = false;
      } else if (listMode === 'whitelist' && !inList) {
        shouldSpoof = false;
      }

      if (!shouldSpoof) {
        settings.uaSpoofEnabled = false;
        settings.touchSpoofEnabled = false;
        settings.jsBlockEnabled = false;
        settings.jsProtectEnabled = false;
        settings.geoSpoofEnabled = false;
        settings.mediaQuerySpoofEnabled = false;
        settings.timingShieldEnabled = false;
      } else {
        // Apply website rules if we are spoofing
        for (const rule of websiteRules) {
          const rulePattern = rule.website.replace(/\*/g, '');
          if (currentHostname.includes(rulePattern)) {
            settings.selectedUA = rule.userAgent || settings.selectedUA;
            settings.uaSpoofEnabled = rule.uaSpoofEnabled !== false;
            settings.maxTouchPoints = rule.touchPoints || 0;
            settings.touchSpoofEnabled = (rule.touchPoints || 0) > 0;
            settings.jsBlockEnabled = !!rule.jsBlocked;
            settings.jsProtectEnabled = !!rule.jsProtected;
            settings.mediaQuerySpoofEnabled = !!rule.mediaQuerySpoofEnabled;
            settings.timingShieldEnabled = !!rule.timingShieldEnabled;
            settings.geoSpoofEnabled = !!rule.geoSpoofEnabled;
            settings.geoCoords = rule.geoCoords || settings.geoCoords;
            break;
          }
        }
      }

      // Dispatch immediately from isolated world to ensure inject.js receives it (CSP safe)
      window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(settings) }));

      if (settings.jsBlockEnabled) {
        blockInlineJavaScript();
      }
    });
  }).catch(err => {
    console.warn('[MorphAgent 4.0] Storage access error:', err);
  });

  if (api.runtime && api.runtime.onMessage) {
    api.runtime.onMessage.addListener((message) => {
      if (message.type === 'update-settings' && message.data) {
        window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(message.data) }));
      }
    });
  }

  // Telemetry Bridge: Listen for threats detected by inject.js and forward to background script
  window.addEventListener('morph-threat-detected', (e) => {
    if (e.detail && e.detail.type) {
      try {
        api.runtime.sendMessage({
          type: 'log-threat',
          data: e.detail
        });
      } catch (err) {}
    }
  });


  function blockInlineJavaScript() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "script-src 'none'";
    (document.head || document.documentElement).appendChild(meta);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            node.remove();
          }
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
