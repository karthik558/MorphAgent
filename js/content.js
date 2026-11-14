// content.js - MorphAgent 4.8.2
// Inject stealth scripts into the page context immediately to override native methods.

(function () {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  // Match hostnames at domain boundaries, never arbitrary substrings.
  function matchesSite(hostname, raw) {
    let domain = String(raw || '').trim().toLowerCase().replace(/^\*:\/\//, 'https://');
    try { if (domain.includes('://')) domain = new URL(domain).hostname; } catch { return false; }
    domain = domain.replace(/^\*\./, '').replace(/\/$/, '');
    return !!domain && (hostname === domain || hostname.endsWith('.' + domain));
  }

  // Preemptively inject cosmetic stylesheet at document_start for instant zero-flicker ad suppression
  // Wait for stored preferences before applying cosmetic filtering.

  // Retrieve settings and initialize stealth suite
  api.storage.local.get([
    'temporaryExceptions',
    'selectedUA',
    'uaSpoofEnabled',
    'touchSpoofEnabled',
    'maxTouchPoints',
    'jsBlockEnabled',
    'jsProtectEnabled',
    'activeCategory',
    'geoSpoofEnabled',
    'geoCoords',
    'hardwareHarmonizeEnabled',
    'customHardwareCores',
    'customDeviceMemory',
    'autoHarmonizeTzEnabled',
    'geoTimezone',
    'geoLocale',
    'adBlockEnabled',
    'adBlockCosmeticEnabled',
    'adBlockAntiAdblockEnabled',
    'adBlockWhitelist',
    'filtersState',
    'trackersBlockEnabled',
    'removeTrackingParamsEnabled',
    'hideSearchQueriesEnabled',
    'sendDntGpcEnabled',
    'webrtcPreventLeakEnabled',
    'removeXClientDataEnabled',
    'identityBundle',
    'customCosmeticRules'
  ]).then((settings) => {
    return api.storage.sync.get(['blockList', 'whiteList', 'listMode', 'websiteRules']).then((syncResult) => {
      const blockList = syncResult.blockList || [];
      const whiteList = syncResult.whiteList || [];
      const listMode = syncResult.listMode || 'blacklist';
      const websiteRules = syncResult.websiteRules || [];
      const currentHostname = window.location.hostname;

      let inBlacklist = false;
      for (const blockItem of blockList) {
        const pattern = blockItem.website;
        if (matchesSite(currentHostname, pattern)) {
          inBlacklist = true;
          break;
        }
      }

      let inWhitelist = false;
      for (const whiteItem of whiteList) {
        const pattern = whiteItem.website;
        if (matchesSite(currentHostname, pattern)) {
          inWhitelist = true;
          break;
        }
      }

      let shouldSpoof = true;
      if (listMode === 'blacklist' && inBlacklist) {
        shouldSpoof = false;
      } else if (listMode === 'whitelist' && !inWhitelist) {
        shouldSpoof = false;
      }

      if (!shouldSpoof || matchesSite(currentHostname, 'proxyium.com')) {
        settings.uaSpoofEnabled = false;
        settings.touchSpoofEnabled = false;
        settings.jsBlockEnabled = false;
        settings.jsProtectEnabled = false;
        settings.geoSpoofEnabled = false;
        settings.hardwareHarmonizeEnabled = false;
        settings.mediaQuerySpoofEnabled = false;
        settings.timingShieldEnabled = false;
      } else {
        // Apply website rules if we are spoofing
        for (const rule of websiteRules) {
          const rulePattern = rule.website || '';
          if (rulePattern && matchesSite(currentHostname, rulePattern)) {
            settings.selectedUA = rule.userAgent || settings.selectedUA;
            settings.uaSpoofEnabled = settings.uaSpoofEnabled !== false && rule.uaSpoofEnabled !== false;
            settings.maxTouchPoints = rule.touchPoints || 0;
            settings.touchSpoofEnabled = rule.touchSpoofEnabled !== undefined ? !!rule.touchSpoofEnabled : false;
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

      const exceptions = (settings.temporaryExceptions || []).filter(e => (e.expiresAt === null || e.expiresAt > Date.now()) && matchesSite(currentHostname, e.domain));
      const paused = scope => exceptions.some(e => e.scope === 'all' || e.scope === scope);
      if (paused('fingerprint')) for (const key of ['uaSpoofEnabled','touchSpoofEnabled','jsProtectEnabled','geoSpoofEnabled','hardwareHarmonizeEnabled','mediaQuerySpoofEnabled','timingShieldEnabled']) settings[key] = false;
      if (paused('scripts')) settings.jsBlockEnabled = false;
      if (paused('filters')) {
        settings.adBlockWhitelist = [...(settings.adBlockWhitelist || []), currentHostname];
        for (const key of ['removeTrackingParamsEnabled','hideSearchQueriesEnabled','sendDntGpcEnabled']) settings[key] = false;
      }
      applyProtection(settings);

      // Dispatch immediately from isolated world to ensure inject.js receives it (CSP safe)
      window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(settings) }));


    });
  }).catch(err => {
    console.warn('[MorphAgent 4.8.2] Storage access error:', err);
  });

  function stripTrackingParameters() {
    try {
      const url = new URL(window.location.href);
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
        'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'mc_eid', 'yclid',
        '_hsenc', '_openstat', 'igshid', 'dclid', 'twclid',
        'wickedid', 'sc_clid', 'matomo_campaign', 'pk_campaign', 'gad_source'
      ];
      let changed = false;
      trackingParams.forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          changed = true;
        }
      });
      if (changed) {
        window.history.replaceState(window.history.state, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash);
      }
    } catch (e) { }
  }

  let protectionSettings = {};
  let cosmeticObserver = null;
  let cosmeticTimer = null;
  let videoTimer = null;
  let countedAds = new WeakSet();

  function applyProtection(settings) {
    protectionSettings = { ...protectionSettings, ...settings };
    const options = protectionSettings;
    const excluded = (Array.isArray(options.adBlockWhitelist) ? options.adBlockWhitelist : []).some(site => matchesSite(location.hostname, site));
    const active = options.adBlockEnabled !== false && !excluded;
    const engine = globalThis.MorphAgentAdBlock;
    const customSelectors = active && Array.isArray(options.customCosmeticRules)
      ? options.customCosmeticRules.filter(rule => rule && matchesSite(location.hostname, rule.domain) && typeof rule.selector === 'string' && rule.selector.length <= 200 && !/[{}<>\\]|url\s*\(|expression\s*\(/i.test(rule.selector)).map(rule => rule.selector)
      : [];
    const selectors = active ? engine.cosmeticSelectors(options, location.hostname).concat(customSelectors) : [];
    if (cosmeticObserver) cosmeticObserver.disconnect();
    clearTimeout(cosmeticTimer);
    clearInterval(videoTimer);
    document.getElementById('morph-adblock-styles')?.remove();

    if (options.removeTrackingParamsEnabled !== false) stripTrackingParameters();
    if (selectors.length) {
      const style = document.createElement('style');
      style.id = 'morph-adblock-styles';
      // Independent rules keep an unsupported selector from invalidating the rest.
      style.textContent = selectors.map(selector => `${selector} { display: none !important; }`).join('\n');
      const scan = () => {
        if (!style.isConnected) (document.head || document.documentElement)?.appendChild(style);
        let count = 0;
        for (const selector of selectors) {
          try {
            for (const element of document.querySelectorAll(selector)) {
              if (!countedAds.has(element)) { countedAds.add(element); count++; }
            }
          } catch { /* Browser may not support every cosmetic selector. */ }
        }
        if (count) api.runtime.sendMessage({ type: 'log-ad-blocked', data: { domain: location.hostname, count, isTracker: false } }).catch(() => {});
      };
      scan();
      cosmeticObserver = new MutationObserver(() => {
        clearTimeout(cosmeticTimer);
        cosmeticTimer = setTimeout(scan, 100);
      });
      cosmeticObserver.observe(document, { childList: true, subtree: true });
    }
    if (active && options.adBlockAntiAdblockEnabled !== false && engine.filterEnabled(options.filtersState, 'ads') && matchesSite(location.hostname, 'youtube.com')) {
      const skipAd = () => {
        const player = document.querySelector('#movie_player.ad-showing, #movie_player.ad-interrupting');
        if (!player) return;
        const skip = player.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot button');
        if (skip && !skip.disabled) skip.click();
        const video = player.querySelector('video');
        // Seek only a player explicitly marked as showing an ad. Preserve volume and speed.
        if (video && Number.isFinite(video.duration) && video.duration > 0 && video.currentTime < video.duration) {
          try { video.currentTime = video.duration; } catch { /* Some streams are not seekable. */ }
        }
      };
      skipAd();
      videoTimer = setInterval(skipAd, 500);
    }
  }

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const keys = ['adBlockEnabled', 'adBlockCosmeticEnabled', 'adBlockAntiAdblockEnabled', 'adBlockWhitelist', 'filtersState', 'removeTrackingParamsEnabled', 'customCosmeticRules'];
    if (!keys.some(key => key in changes)) return;
    const updated = {};
    for (const key of keys) if (key in changes) updated[key] = changes[key].newValue;
    applyProtection(updated);
  });

  if (api.runtime && api.runtime.onMessage) {
    api.runtime.onMessage.addListener((message) => {
      if (message.type === 'update-settings' && message.data) {
        window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(message.data) }));
      }
      if (message.type === 'pick-element' && window.top === window) {
        startElementPicker();
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
      } catch (err) { }
    }
  });


  function startElementPicker() {
    if (document.getElementById('morph-element-picker')) return;
    const box = document.createElement('div');
    box.id = 'morph-element-picker';
    box.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483646;border:2px solid #ff0b2a;background:rgba(255,11,42,0.15);';
    const bar = document.createElement('div');
    bar.id = 'morph-element-picker-bar';
    bar.textContent = 'Click an element to hide it on this site. Esc cancels.';
    bar.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#181818;color:#fff;border:1px solid #ff0b2a;border-radius:8px;padding:8px 12px;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
    document.documentElement.appendChild(box);
    document.documentElement.appendChild(bar);
    const selectorFor = element => {
      if (!(element instanceof Element) || element === bar || element === box) return '';
      if (element.id && /^[A-Za-z][\w-]*$/.test(element.id)) {
        const id = '#' + CSS.escape(element.id);
        try { if (document.querySelectorAll(id).length === 1) return id; } catch { /* Keep walking. */ }
      }
      const parts = [];
      let node = element;
      while (node && node.nodeType === 1 && node !== document.body && parts.length < 4) {
        let part = node.tagName.toLowerCase();
        const classes = [...node.classList].filter(name => /^[A-Za-z][\w-]*$/.test(name)).slice(0, 2);
        if (classes.length) part += classes.map(name => '.' + CSS.escape(name)).join('');
        const parent = node.parentElement;
        if (parent) {
          const siblings = [...parent.children].filter(child => child.tagName === node.tagName);
          if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
        }
        parts.unshift(part);
        node = parent;
      }
      return parts.join(' > ');
    };
    const stop = () => {
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('click', choose, true);
      document.removeEventListener('keydown', cancel, true);
      box.remove();
      bar.remove();
    };
    const move = event => {
      const target = event.target;
      if (!(target instanceof Element) || target === bar) return;
      const rect = target.getBoundingClientRect();
      box.style.left = rect.left + 'px';
      box.style.top = rect.top + 'px';
      box.style.width = rect.width + 'px';
      box.style.height = rect.height + 'px';
    };
    const choose = event => {
      event.preventDefault();
      event.stopPropagation();
      const selector = selectorFor(event.target);
      stop();
      if (selector) api.runtime.sendMessage({ type: 'save-cosmetic-rule', data: { domain: location.hostname, selector } }).catch(() => {});
    };
    const cancel = event => { if (event.key === 'Escape') stop(); };
    document.addEventListener('mousemove', move, true);
    document.addEventListener('click', choose, true);
    document.addEventListener('keydown', cancel, true);
  }

  // =========================================================================
  // Proxyium Anonymous Web Tunnel Engine
  // =========================================================================
  if (window.location.hostname.includes('proxyium.com')) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const morphTarget = urlParams.get('morph_url');
      const morphCountry = urlParams.get('morph_country') || 'pl';

      if (morphTarget) {
        let attempts = 0;
        const maxAttempts = 50;

        const executeProxyiumTunnel = () => {
          attempts++;
          const form = document.getElementById('web_proxy_form');
          const input = document.getElementById('unique-form-control');
          const countrySelect = document.getElementById('proxy_country');
          const submitBtn = document.getElementById('unique-btn-blue');

          if (form && input) {
            // Render sleek HUD notification
            if (document.body && !document.getElementById('morph-proxy-tunnel-badge')) {
              const badge = document.createElement('div');
              badge.id = 'morph-proxy-tunnel-badge';
              badge.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#181818;color:#ffffff;border:1px solid #ff0b2a;box-shadow:0 4px 20px rgba(255,11,42,0.4);border-radius:8px;padding:10px 18px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:12px;z-index:9999999;display:flex;align-items:center;gap:10px;pointer-events:none;';
              const dot = '<span style="display:inline-block;width:8px;height:8px;background:#ff0b2a;border-radius:50%;box-shadow:0 0 8px #ff0b2a;"></span>';
              badge.innerHTML = `${dot}<span style="font-weight:700;letter-spacing:0.5px;color:#ff0b2a;">MORPHAGENT TUNNEL:</span> Connecting anonymously to <span style="font-weight:600;color:#fff;">${morphTarget}</span> via <span style="color:#10b981;font-weight:600;">${morphCountry.toUpperCase()}</span> exit node...`;
              document.body.appendChild(badge);
            }

            input.value = morphTarget;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            if (countrySelect && morphCountry) {
              countrySelect.value = morphCountry;
              countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
              const niceOption = document.querySelector(`.nice-select .option[data-value="${morphCountry}"]`);
              if (niceOption) {
                niceOption.click();
              }
            }

            // Clean query parameters from address bar to prevent reload loop
            try {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) { }

            setTimeout(() => {
              if (submitBtn) {
                submitBtn.click();
              } else {
                form.submit();
              }
            }, 60);
          } else if (attempts < maxAttempts) {
            setTimeout(executeProxyiumTunnel, 60);
          }
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', executeProxyiumTunnel);
        } else {
          executeProxyiumTunnel();
        }
      }
    } catch (e) {
      console.warn('[MorphAgent] Proxyium auto-tunnel initialization failed:', e);
    }
  }
})();
