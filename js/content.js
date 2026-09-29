// content.js - MorphAgent 4.5.0
// Inject stealth scripts into the page context immediately to override native methods.

(function () {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  // Preemptively inject cosmetic stylesheet at document_start for instant zero-flicker ad suppression
  injectCosmeticAdBlocker();

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
    'trackersBlockEnabled',
    'removeTrackingParamsEnabled',
    'hideSearchQueriesEnabled',
    'sendDntGpcEnabled',
    'webrtcPreventLeakEnabled',
    'removeXClientDataEnabled'
  ]).then((settings) => {
    api.storage.sync.get(['blockList', 'whiteList', 'listMode', 'websiteRules']).then((syncResult) => {
      const blockList = syncResult.blockList || [];
      const whiteList = syncResult.whiteList || [];
      const listMode = syncResult.listMode || 'blacklist';
      const websiteRules = syncResult.websiteRules || [];
      const currentHostname = window.location.hostname;

      let inBlacklist = false;
      for (const blockItem of blockList) {
        const pattern = blockItem.website.replace(/\*/g, '');
        if (currentHostname.includes(pattern)) {
          inBlacklist = true;
          break;
        }
      }

      let inWhitelist = false;
      for (const whiteItem of whiteList) {
        const pattern = whiteItem.website.replace(/\*/g, '');
        if (currentHostname.includes(pattern)) {
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

      // Check AdBlock Whitelist
      const adBlockWhitelist = settings.adBlockWhitelist || [];
      const isAdWhitelisted = adBlockWhitelist.some(site => currentHostname.includes(site.replace(/\*/g, '')));
      const isAdBlockActive = (settings.adBlockEnabled !== false) && !isAdWhitelisted;

      // Clean URL tracking parameters immediately if enabled
      if (settings.removeTrackingParamsEnabled !== false) {
        stripTrackingParameters();
      }

      if (isAdBlockActive && settings.adBlockCosmeticEnabled !== false) {
        injectCosmeticAdBlocker();
        monitorAndCleanAdElements();
      } else {
        const existingStyle = document.getElementById('morph-adblock-styles');
        if (existingStyle) existingStyle.remove();
      }

      // Dispatch immediately from isolated world to ensure inject.js receives it (CSP safe)
      window.dispatchEvent(new CustomEvent('morph-agent-update', { detail: JSON.stringify(settings) }));

      if (settings.jsBlockEnabled) {
        blockInlineJavaScript();
      }
    });
  }).catch(err => {
    console.warn('[MorphAgent 4.5] Storage access error:', err);
  });

  function stripTrackingParameters() {
    try {
      const url = new URL(window.location.href);
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
        'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'mc_eid', 'yclid',
        '_hsenc', '_openstat', 'igshid', 'si', 'ref_', 'dclid', 'twclid',
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
    } catch (e) {}
  }

  function injectCosmeticAdBlocker() {
    if (document.getElementById('morph-adblock-styles')) return;
    const style = document.createElement('style');
    style.id = 'morph-adblock-styles';
    style.textContent = `
      /* Benchmark & Test Suite Ad Selectors (adblock.turtlecute.org, d3ward, adblock-tester.com, etc.) */
      #cts_test, #ad_ctd, [id="cts_test"], [id="ad_ctd"],
      .adbox.banner_ads.adsbox, .adbox, .banner_ads, .adsbox, .textads, .text-ad, .text-ads,
      [class*="banner_ads"], [class*="textads"], [class*="adbox"],
      div[data-ads], [data-ads], [id^="yandex_rtb_"], #yandex_rtb_R-A-491776-1,
      .includeWrapper, .include, .include > img, .include > object, .include > embed,
      img[src*="pr_advertising"], img[src*="/banners/"],
      object[data*="pr_advertising"], object[data*="/banners/"],
      embed[src*="pr_advertising"], embed[src*="/banners/"],

      /* Standard Google / AdSense / DFP */
      ins.adsbygoogle, [id^="google_ads_"], [id^="div-gpt-ad"], [id*="google_ads"],
      .google-ad, div[data-google-query-id], div[id^="dfp-ad-"],

      /* General Ad Containers, Banners & Slots */
      .ad-banner, .ad-container, .ad-slot, .ad-wrapper, .ad_slot,
      .ad-placeholder, .advertisement, .sponsored-post, .sponsor-badge,
      [data-ad-slot], [data-ad-client], [data-ad-unit], [data-ad-name], [data-native-ad],
      .ad_unit, .ad_container, .ad-header, .ad-sidebar, .ad-footer, .ads-holder, .advert, .ad-zone,

      /* Recommendation & Native Widgets */
      .taboola-ad, .outbrain-ad, #rc-widget, .revcontent-ad, .mgid-widget,
      div[class*="sponsored-content"], div[class*="promoted-content"],
      aside[class*="ad-"], section[class*="advert"],

      /* Video & YouTube Ads */
      ytd-promoted-video-renderer, ytd-display-ad-renderer, ytd-banner-promo-renderer,
      ytd-statement-banner-renderer, ytd-in-feed-ad-layout-renderer, ytd-ad-slot-renderer,
      ytd-promoted-sparkles-web-renderer, ytd-merch-shelf-renderer, ytd-companion-ad-renderer,
      ytd-brand-video-singleton-renderer,
      ytd-rich-item-renderer:has(.ytd-ad-slot-renderer),
      ytd-rich-item-renderer:has(#ad-badge),
      ytd-rich-section-renderer:has(.ytd-ad-slot-renderer),
      .ytp-ad-overlay-container, .ytp-ad-message-container, .ytp-ad-text, .ytp-ad-preview-container,
      #player-ads, .video-ads, .ytp-ad-module,

      /* Sticky, Floating & Popup Units */
      .popup-ad, .floating-ad, .bottom-ad, .sticky-ad,
      [class*="floating-banner"], [class*="bottom-sticky-ad"],

      /* Social Widgets & Share Overlays */
      .fb-like, .fb-share-button, .twitter-share-button, .twitter-follow-button,
      .linkedin-share-button, .pinterest-save-button,
      iframe[src*="platform.twitter.com/widgets"],
      iframe[src*="facebook.com/plugins/like"],
      iframe[src*="facebook.com/plugins/share"],
      .social-share-buttons, .share-bar,

      /* Cookie Notices, CMP Banners & Annoyance Popups */
      #onetrust-consent-sdk, #onetrust-banner-sdk,
      .cookie-banner, .cookie-notice, .cookie-consent, .consent-modal,
      #cookie-law-info-bar, #cookie-notice, .qc-cmp2-container, #didomi-host,
      .newsletter-popup, .newsletter-modal, .subscribe-popup,
      div[class*="cookie-popup"], div[class*="consent-banner"],

      /* Third-Party Ad Iframes */
      iframe[src*="doubleclick"], iframe[src*="googlesyndication"],
      iframe[src*="adnxs"], iframe[src*="criteo"],
      iframe[src*="amazon-adsystem"], iframe[src*="taboola"], iframe[src*="outbrain"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        width: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      }
    `;
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    } else {
      const observer = new MutationObserver(() => {
        const root = document.head || document.documentElement;
        if (root) {
          root.appendChild(style);
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  }

  function monitorAndCleanAdElements() {
    let loggedCount = 0;
    const querySelectors = '#cts_test, #ad_ctd, .adbox, .banner_ads, .adsbox, .textads, [class*="banner_ads"], [class*="textads"], [class*="adbox"], div[data-ads], [data-ads], [id^="yandex_rtb_"], #yandex_rtb_R-A-491776-1, .includeWrapper, .include, img[src*="pr_advertising"], img[src*="/banners/"], object[data*="pr_advertising"], embed[src*="pr_advertising"], ins.adsbygoogle, [id^="google_ads_"], [id^="div-gpt-ad"], .ad-banner, .ad-container, .ad-slot, iframe[src*="doubleclick"], iframe[src*="googlesyndication"], ytd-ad-slot-renderer, .taboola-ad, .outbrain-ad';
    
    const countAds = () => {
      try {
        const found = document.querySelectorAll(querySelectors);
        found.forEach(el => {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('height', '0px', 'important');
          el.style.setProperty('width', '0px', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('min-height', '0px', 'important');
          el.style.setProperty('max-height', '0px', 'important');
        });
        if (found.length > loggedCount) {
          const delta = found.length - loggedCount;
          loggedCount = found.length;
          api.runtime.sendMessage({
            type: 'log-ad-blocked',
            data: { domain: window.location.hostname, count: delta, isTracker: false }
          });
        }
      } catch(e) {}
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', countAds);
    } else {
      countAds();
    }
    setTimeout(countAds, 1000);
    setTimeout(countAds, 2500);

    // Watch DOM mutations to catch dynamic ad insertions immediately
    try {
      const observer = new MutationObserver(() => {
        countAds();
      });
      observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch(e) {}
  }

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
      } catch (err) { }
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
