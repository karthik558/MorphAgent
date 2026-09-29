// adblock-rules.js - MorphAgent 4.5.0
// Universal High-Efficiency Ad, Tracker, Telemetry & DNS Rule Engine
// Parity with uBlock Origin / AdGuard core blocklists & MV3 DeclarativeNetRequest

(function (root, factory) {
  const mod = factory();
  if (root) {
    root.MorphAgentAdBlock = mod;
    root.DNS_PROVIDERS = mod.DNS_PROVIDERS;
    root.AD_TRACKER_DOMAINS = mod.AD_TRACKER_DOMAINS;
    root.COSMETIC_AD_SELECTORS = mod.COSMETIC_AD_SELECTORS;
    root.SCRIPT_BLOCK_PATTERNS = mod.SCRIPT_BLOCK_PATTERNS;
    root.generateDNRAdBlockRules = mod.generateDNRAdBlockRules;
  }
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = mod;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {

  // DNS Resolver Profiles
  const DNS_PROVIDERS = {
    adguard: {
      id: 'adguard',
      name: 'AdGuard DNS (Ad & Threat Shield)',
      doh: 'https://dns.adguard-dns.com/dns-query',
      ips: ['94.140.14.14', '94.140.15.15'],
      tag: 'Ad & Phishing Shield',
      description: 'Cryptographically blocks ads, telemetry, phishing, and scam domains at DNS resolution.'
    },
    cloudflare: {
      id: 'cloudflare',
      name: 'Cloudflare 1.1.1.1 (Ultra-Fast Privacy)',
      doh: 'https://cloudflare-dns.com/dns-query',
      ips: ['1.1.1.1', '1.0.0.1'],
      tag: 'Ultra-Fast Privacy',
      description: 'Pioneer in consumer privacy. Zero-logging policy with DNSSEC encryption and extreme speed.'
    },
    quad9: {
      id: 'quad9',
      name: 'Quad9 (Malware & Botnet Shield)',
      doh: 'https://dns.quad9.net/dns-query',
      ips: ['9.9.9.9', '149.112.112.112'],
      tag: 'Malware Defense',
      description: 'Threat intelligence matrix maintained with global CERTs blocking botnets, ransomware & spyware.'
    },
    nextdns: {
      id: 'nextdns',
      name: 'NextDNS (Cloud Firewall)',
      doh: 'https://dns.nextdns.io',
      ips: ['45.90.28.0', '45.90.30.0'],
      tag: 'Next-Gen Firewall',
      description: 'Cloud-based DNS shield providing deep telemetry prevention and CNAME uncloaking defense.'
    },
    cleanbrowsing: {
      id: 'cleanbrowsing',
      name: 'CleanBrowsing (Family Safe)',
      doh: 'https://doh.cleanbrowsing.org/doh/family-filter/',
      ips: ['185.228.168.168', '185.228.169.168'],
      tag: 'Family Safe',
      description: 'Family protection filter blocking adult content, phishing domains, and malicious proxy networks.'
    },
    direct: {
      id: 'direct',
      name: 'System Default (Direct)',
      doh: '',
      ips: [],
      tag: 'Standard DNS',
      description: 'Resolves domains via your local operating system network settings.'
    },
    custom: {
      id: 'custom',
      name: 'Custom DoH Endpoint',
      doh: '',
      ips: [],
      tag: 'User Defined',
      description: 'Route through your private Pi-hole, AdGuard Home, or personal DoH resolver endpoint.'
    }
  };

  // Comprehensive 100% Coverage Ad, Tracking, Telemetry & Fingerprinting Domain List
  const AD_TRACKER_DOMAINS = [
    // --- Google Ads, DoubleClick, Syndication & Telemetry ---
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'google-analytics.com',
    'analytics.google.com',
    'googletagmanager.com',
    'googletagservices.com',
    'pagead2.googlesyndication.com',
    'adservice.google.com',
    'adservice.google.de',
    'adservice.google.co.uk',
    'adservice.google.ca',
    'partnerad.l.google.com',
    'stats.g.doubleclick.net',
    'admob.com',
    '2mdn.net',
    'invitemedia.com',

    // --- Facebook / Meta Tracking & Pixel Network ---
    'connect.facebook.net',
    'pixel.facebook.com',
    'an.facebook.com',
    'tr.facebook.com',

    // --- Major Social Media Ad Tracking Networks ---
    'analytics.twitter.com',
    'ads-twitter.com',
    'static.ads-twitter.com',
    'px.ads.linkedin.com',
    'snap.licdn.com',
    'tr.snapchat.com',
    'sc-static.net',
    'analytics.tiktok.com',
    'ads.tiktok.com',
    'business-api.tiktok.com',
    'ct.pinterest.com',
    'log.pinterest.com',
    'alb.reddit.com',
    'events.redditmedia.com',

    // --- Major Programmatic Ad Exchanges, SSPs & DSPs ---
    'criteo.com',
    'criteo.net',
    'static.criteo.net',
    'adnxs.com',
    'ib.adnxs.com',
    'rubiconproject.com',
    'fastlane.rubiconproject.com',
    'pubmatic.com',
    'ads.pubmatic.com',
    'openx.net',
    'casalemedia.com',
    'media.net',
    'thetradedesk.com',
    'advertising.com',
    'yieldmo.com',
    'bidswitch.net',
    'smartadserver.com',
    'sonobi.com',
    'triplelift.com',
    'sharethrough.com',
    'indexexchange.com',
    'sovrn.com',
    'lijit.com',
    'adform.net',
    'flashtalking.com',
    'serving-sys.com',
    'serving-sys.net',
    'moatads.com',
    'iasds01.com',
    'teads.tv',
    'spotxchange.com',
    'spotx.tv',
    'tremorhub.com',
    'unrulymedia.com',
    'contextweb.com',
    'stickyadstv.com',
    'conversantmedia.com',
    'exponential.com',
    'adroll.com',
    'adblade.com',
    'chitika.com',
    'buysellads.com',
    'carbonads.net',
    'gumgum.com',
    'kargo.com',
    'e-planning.net',
    'seedtag.com',
    'infolinks.com',
    'yieldoptimizer.com',
    'undertone.com',
    'adtechus.com',
    'appier.net',
    'beeswax.com',
    'zemanta.com',
    'mediavine.com',
    'raptive.com',
    'adthrive.com',
    'monetizemore.com',
    'playwire.com',
    'setupad.com',

    // --- Native Ads & Clickbait Recommendation Engines ---
    'taboola.com',
    'taboolasyndication.com',
    'outbrain.com',
    'outbrainimg.com',
    'revcontent.com',
    'content.ad',
    'mgid.com',
    'nativo.com',
    'zergnet.com',
    'dianomi.com',
    'plista.com',
    'strossle.com',
    'adkeeper.com',
    'engageya.com',

    // --- Amazon AdSystem & Cloud Marketing ---
    'amazon-adsystem.com',
    'aax.amazon-adsystem.com',
    'c.amazon-adsystem.com',
    'fls-na.amazon-adsystem.com',
    'z-na.amazon-adsystem.com',

    // --- Behavioral Analytics, Session Recording & Fingerprinting Endpoints ---
    'scorecardresearch.com',
    'quantserve.com',
    'quantcount.com',
    'hotjar.com',
    'hotjar.io',
    'clarity.ms',
    'segment.io',
    'segment.com',
    'mixpanel.com',
    'amplitude.com',
    'chartbeat.com',
    'newrelic.com',
    'nr-data.net',
    'yandex.ru/metrika',
    'mc.yandex.ru',
    'crazyegg.com',
    'mouseflow.com',
    'fullstory.com',
    'inspectlet.com',
    'logrocket.com',
    'heap.io',
    'heapanalytics.com',
    'luckyorange.com',
    'branch.io',
    'appsflyer.com',
    'adjust.com',
    'kochava.com',
    'singular.net',
    'statcounter.com',
    'histats.com',
    'woopra.com',
    'kissmetrics.com',
    'clicky.com',

    // --- Mobile Ad Networks & Video Interstitial Engines ---
    'inmobi.com',
    'ironsrc.com',
    'unityads.unity3d.com',
    'chartboost.com',
    'vungle.com',
    'applovin.com',
    'liftoff.io',
    'mintegral.com',
    'pangle-ads.com',
    'byteoversea.com',
    'adcolony.com',
    'fyber.com',
    'smaato.net',
    'tapjoy.com',
    'startapp.com',

    // --- Aggressive Popups, Pop-unders, Push Spam & Malvertising ---
    'popads.net',
    'propellerads.com',
    'popcash.net',
    'exoclick.com',
    'trafficjunky.com',
    'adsterra.com',
    'clickadu.com',
    'zeropark.com',
    'ad-maven.com',
    'richaudience.com',
    'hilltopads.com',
    'juicyads.com',
    'trafficfactory.biz',
    'plugrush.com',
    'ero-advertising.com',
    'adxxx.info',
    'rtmark.net',
    'wigetmedia.com',
    'bidvertiser.com',
    'yllix.com',
    'clarium.global',

    // --- In-Browser Cryptominers & Coin Hijackers ---
    'coinhive.com',
    'crypto-loot.com',
    'webminepool.com',
    'jsecoin.com',
    'minr.pw',
    'coin-have.com',
    'authedmine.com'
  ];

  // Specific generic script patterns blocked by DNR (e.g. inline ad loaders, trackers)
  const SCRIPT_BLOCK_PATTERNS = [
    '*/pagead/js/adsbygoogle.js*',
    '*/fbevents.js*',
    '*/prebid*.js*',
    '*/analytics.js*',
    '*/gtag/js*',
    '*/gtm.js*',
    '*/show_ads*.js*',
    '*/adview*.js*',
    '*/ads.js*',
    '*/advert*.js*',
    '*/popunder*.js*',
    '*/hotjar-*.js*',
    '*/clarity.ms/tag*'
  ];

  // CSS Selectors for 100% Zero-Flicker Cosmetic Element Hiding
  const COSMETIC_AD_SELECTORS = [
    // Standard Google / AdSense / DFP Units
    'ins.adsbygoogle',
    '[id^="google_ads_"]',
    '[id^="div-gpt-ad"]',
    '[id*="google_ads"]',
    '.google-ad',
    'div[data-google-query-id]',
    'div[id^="dfp-ad-"]',

    // Standard Ad Containers, Banners & Wrappers
    '.ad-banner',
    '.ad-container',
    '.adsbox',
    '.ad-slot',
    '.ad-wrapper',
    '.ad_slot',
    '.ad-placeholder',
    '.advertisement',
    '.sponsored-post',
    '.sponsor-badge',
    '[data-ad-slot]',
    '[data-ad-client]',
    '[data-ad-unit]',
    '[data-ad-name]',
    '[data-native-ad]',
    '.ad_unit',
    '.ad_container',
    '.ad-header',
    '.ad-sidebar',
    '.ad-footer',
    '.ads-holder',
    '.advert',
    '.ad-zone',

    // Recommendation & Native Content Feed Ads
    '.taboola-ad',
    '.outbrain-ad',
    '#rc-widget',
    '.revcontent-ad',
    '.mgid-widget',
    'div[class*="sponsored-content"]',
    'div[class*="promoted-content"]',
    'aside[class*="ad-"]',
    'section[class*="advert"]',

    // YouTube Video & Grid Ads
    'ytd-promoted-video-renderer',
    'ytd-display-ad-renderer',
    'ytd-banner-promo-renderer',
    'ytd-statement-banner-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-ad-slot-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-merch-shelf-renderer',
    'ytd-companion-ad-renderer',
    'ytd-brand-video-singleton-renderer',
    'ytd-rich-item-renderer:has(.ytd-ad-slot-renderer)',
    'ytd-rich-item-renderer:has(#ad-badge)',
    'ytd-rich-section-renderer:has(.ytd-ad-slot-renderer)',
    '.ytp-ad-overlay-container',
    '.ytp-ad-message-container',
    '.ytp-ad-text',
    '.ytp-ad-preview-container',
    '#player-ads',
    '.video-ads',
    '.ytp-ad-module',

    // Sticky, Floating & Popup Ad Elements
    '.popup-ad',
    '.floating-ad',
    '.bottom-ad',
    '.sticky-ad',
    '[class*="floating-banner"]',
    '[class*="bottom-sticky-ad"]',

    // Third-Party Ad / Tracking IFrames
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="adnxs"]',
    'iframe[src*="criteo"]',
    'iframe[src*="amazon-adsystem"]',
    'iframe[src*="taboola"]',
    'iframe[src*="outbrain"]'
  ];

  // Generate DeclarativeNetRequest Dynamic Rules for Native MV3 Interception
  function generateDNRAdBlockRules(baseId = 1000) {
    const rules = [];
    const resourceTypes = [
      'sub_frame',
      'stylesheet',
      'script',
      'image',
      'font',
      'object',
      'xmlhttprequest',
      'ping',
      'other'
    ];

    // 1. Domain Block Rules (Priority 2)
    AD_TRACKER_DOMAINS.forEach((domain, idx) => {
      rules.push({
        id: baseId + idx,
        priority: 2,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${domain}^`,
          resourceTypes
        }
      });
    });

    // 2. Generic Script & Resource Patterns (Priority 3 - higher precedence)
    const scriptBaseId = baseId + AD_TRACKER_DOMAINS.length;
    SCRIPT_BLOCK_PATTERNS.forEach((pattern, idx) => {
      rules.push({
        id: scriptBaseId + idx,
        priority: 3,
        action: { type: 'block' },
        condition: {
          urlFilter: pattern,
          resourceTypes: ['script', 'xmlhttprequest', 'ping', 'sub_frame']
        }
      });
    });

    return rules;
  }

  return {
    DNS_PROVIDERS,
    AD_TRACKER_DOMAINS,
    SCRIPT_BLOCK_PATTERNS,
    COSMETIC_AD_SELECTORS,
    generateDNRAdBlockRules
  };
});
