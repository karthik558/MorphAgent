// content.js - MorphAgent 4.0.2
// 10-Tier Anti-Fingerprinting & Stealth Content Injection Suite

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
    // Dispatch immediately from isolated world to ensure inject.js receives it (CSP safe)
    window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(settings) }));

    if (settings.jsBlockEnabled) {
      blockInlineJavaScript();
    }
  }).catch(err => {
    console.warn('[MorphAgent 4.0] Storage access error:', err);
  });

  // Check per-website rule overrides
  api.storage.sync.get(['websiteRules']).then((result) => {
    const websiteRules = result.websiteRules || [];
    const currentHostname = window.location.hostname;

    for (const rule of websiteRules) {
      const rulePattern = rule.website.replace(/\*/g, '');
      if (currentHostname.includes(rulePattern)) {
        if (rule.jsBlocked) {
          blockInlineJavaScript();
        }
        const ruleSettings = {
          selectedUA: rule.userAgent,
          uaSpoofEnabled: rule.uaSpoofEnabled !== false,
          maxTouchPoints: rule.touchPoints || 0,
          touchSpoofEnabled: (rule.touchPoints || 0) > 0,
          jsProtectEnabled: !!rule.jsProtected,
          geoSpoofEnabled: !!rule.geoSpoofEnabled,
          geoCoords: rule.geoCoords
        };
        // Dispatch directly from isolated world
        window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(ruleSettings) }));
        break;
      }
    }
  }).catch(() => {});

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
