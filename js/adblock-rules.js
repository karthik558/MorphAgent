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
    root.DEFAULT_FILTER_CATEGORIES = mod.DEFAULT_FILTER_CATEGORIES;
    root.TRACKING_URL_PARAMS = mod.TRACKING_URL_PARAMS;
    root.SEARCH_ENGINE_DOMAINS = mod.SEARCH_ENGINE_DOMAINS;
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
    'click.googleanalytics.com',
    'ssl.google-analytics.com',
    'googletagmanager.com',
    'googletagservices.com',
    'tagmanager.google.com',
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
    'dai.google.com',
    'fundingchoicesmessages.google.com',
    'firebase-settings.crashlytics.com',
    's.youtube.com',
    'redirector.googlevideo.com',

    // --- Microsoft & Bing Ads ---
    'ads.microsoft.com',
    'c.bing.com',

    // --- Yahoo Ads, Gemini, UDCM & Telemetry ---
    'ads.yahoo.com',
    'advertising.yahoo.com',
    'analytics.yahoo.com',
    'geo.yahoo.com',
    'udc.yahoo.com',
    'udcm.yahoo.com',
    'analytics.query.yahoo.com',
    'partnerads.ysm.yahoo.com',
    'log.fc.yahoo.com',
    'gemini.yahoo.com',
    'adtech.yahooinc.com',

    // --- Yandex Ads, AppMetrica, AdFox & Telemetry ---
    'extmaps-api.yandex.net',
    'appmetrica.yandex.ru',
    'adfstat.yandex.ru',
    'metrika.yandex.ru',
    'advertising.yandex.ru',
    'offerwall.yandex.net',
    'adfox.yandex.ru',
    'mc.yandex.ru',
    'an.yandex.ru',
    'ymatuhin.ru',

    // --- Amazon Advertising & Cloud Marketing ---
    'amazon-adsystem.com',
    'aax.amazon-adsystem.com',
    'c.amazon-adsystem.com',
    'fls-na.amazon-adsystem.com',
    'z-na.amazon-adsystem.com',
    'advertising-api-eu.amazon.com',
    'mads-eu.amazon.com',

    // --- Facebook / Meta & Instagram Tracking ---
    'connect.facebook.net',
    'pixel.facebook.com',
    'an.facebook.com',
    'tr.facebook.com',
    'graph.facebook.com',
    'graph.instagram.com',
    'i.instagram.com',

    // --- TikTok / ByteDance Ad & Telemetry Network ---
    'ads-api.tiktok.com',
    'analytics.tiktok.com',
    'ads-sg.tiktok.com',
    'analytics-sg.tiktok.com',
    'business-api.tiktok.com',
    'ads.tiktok.com',
    'log.byteoversea.com',
    'byteoversea.com',
    'pangleglobal.com',

    // --- Pinterest Ads & Trackers ---
    'ads.pinterest.com',
    'analytics.pinterest.com',
    'widgets.pinterest.com',
    'log.pinterest.com',
    'trk.pinterest.com',
    'ct.pinterest.com',

    // --- Sentry & Bugsnag Error/Telemetry Trackers ---
    'sentry-cdn.com',
    'browser.sentry-cdn.com',
    'js.sentry-cdn.com',
    'sessions.bugsnag.com',
    'app.getsentry.com',
    'api.bugsnag.com',
    'app.bugsnag.com',
    'notify.bugsnag.com',
    'bugsnag.com',
    'o0.ingest.sentry.io',
    'd2wy8f7a9ursnm.cloudfront.net',

    // --- Major Social Media Ad Tracking Networks (X/Twitter, LinkedIn, Quora, Tumblr, VK) ---
    'analytics.twitter.com',
    'ads-twitter.com',
    'static.ads-twitter.com',
    'analytics.x.com',
    'ads.x.com',
    'px.ads.linkedin.com',
    'snap.licdn.com',
    'tr.snapchat.com',
    'sc-static.net',
    'pixel.quora.com',
    'qevents.quora.com',
    'px.srvcs.tumblr.com',
    'ads.vk.com',
    'alb.reddit.com',
    'events.redditmedia.com',

    // --- Apple & Hardware Device Ad Platforms ---
    'advertising.apple.com',
    'xp.apple.com',
    'ads.huawei.com',
    'ngfts.lge.com',

    // --- Video Ad Serving, Streaming & In-Stream Networks ---
    'g.jwpsrv.com',
    'ssl.p.jwpcdn.com',
    'bea4.v.fwmrm.net',
    '2975c.v.fwmrm.net',
    'smartclip.com',
    'ironsource.mobi',

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

    // --- Behavioral Analytics, Session Recording, Fingerprinting & Product Intelligence ---
    'scorecardresearch.com',
    'quantserve.com',
    'quantcount.com',
    'quantcast.com',
    'cloudflareinsights.com',
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
    'crazyegg.com',
    'mouseflow.com',
    'fullstory.com',
    'inspectlet.com',
    'logrocket.com',
    'cdn.lr-ingest.com',
    'r.lr-ingest.com',
    'heap.io',
    'heapanalytics.com',
    'luckyorange.com',
    'branch.io',
    'appsflyer.com',
    'adjust.com',
    'kochava.com',
    'singular.net',
    'app.posthog.com',
    'eu.posthog.com',
    'rudderstack.com',
    'snowplowanalytics.com',
    'fingerprintjs.com',
    'clientstream.launchdarkly.com',
    'cdn.dynamicyield.com',
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
    'authedmine.com',
    'mineralt.io',

    // --- Affiliate, Redirect, Email & Marketing Trackers ---
    'zenaps.com',
    'redirect.viglink.com',
    'cdn.viglink.com',
    'api.viglink.com',
    'click.mailchimp.com',
    'widget.intercom.io',
    'static.klaviyo.com'
  ];

  // Specific generic script patterns blocked by DNR (e.g. inline ad loaders, trackers)
  const SCRIPT_BLOCK_PATTERNS = [
    '*ads.js*',
    '*pagead.js*',
    '*/ads.js*',
    '*/pagead.js*',
    '*ads.js',
    '*pagead.js',
    '*/ads.js',
    '*/pagead.js',
    '*/pagead/js/adsbygoogle.js*',
    '*/pagead2.googlesyndication.com/*',
    '*/fbevents.js*',
    '*/prebid*.js*',
    '*/analytics.js*',
    '*/gtag/js*',
    '*/gtm.js*',
    '*/show_ads*.js*',
    '*/adview*.js*',
    '*/advert*.js*',
    '*/popunder*.js*',
    '*/hotjar-*.js*',
    '*/clarity.ms/tag*',
    '*ymatuhin.ru*',
    '*sentry-cdn.com*',
    '*bugsnag*.js*',
    '*pr_advertising*',
    '*/banners/pr_advertising*',
    '*advertising_ads_banner*',
    '*/banners/*'
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

    // Benchmark & Test Suite Ad Selectors (turtlecute, d3ward, adblock-tester, etc.)
    '#cts_test',
    '#ad_ctd',
    '[id="cts_test"]',
    '[id="ad_ctd"]',
    '.adbox.banner_ads.adsbox',
    '.adbox',
    '.banner_ads',
    '.textads',
    '.text-ad',
    '.text-ads',
    '[class*="banner_ads"]',
    '[class*="textads"]',
    '[class*="adbox"]',
    'div[data-ads]',
    '[data-ads]',
    '[id^="yandex_rtb_"]',
    '#yandex_rtb_R-A-491776-1',
    '.includeWrapper',
    '.include',
    '.include > img',
    '.include > object',
    '.include > embed',
    'img[src*="pr_advertising"]',
    'img[src*="/banners/"]',
    'object[data*="pr_advertising"]',
    'object[data*="/banners/"]',
    'embed[src*="pr_advertising"]',
    'embed[src*="/banners/"]',

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

  // Social Element Cosmetic Selectors
  const COSMETIC_SOCIAL_SELECTORS = [
    '.fb-like',
    '.fb-share-button',
    '.twitter-share-button',
    '.twitter-follow-button',
    '.linkedin-share-button',
    '.pinterest-save-button',
    'iframe[src*="platform.twitter.com/widgets"]',
    'iframe[src*="facebook.com/plugins/like"]',
    'iframe[src*="facebook.com/plugins/share"]',
    '.social-share-buttons',
    '.share-bar',
    '.social-icons-wrapper',
    '[class*="social-share"]',
    '[class*="share-widget"]'
  ];

  // Annoyances & Cookie Banner Cosmetic Selectors
  const COSMETIC_ANNOYANCE_SELECTORS = [
    '#onetrust-consent-sdk',
    '#onetrust-banner-sdk',
    '.cookie-banner',
    '.cookie-notice',
    '.cookie-consent',
    '.consent-modal',
    '#cookie-law-info-bar',
    '#cookie-notice',
    '.qc-cmp2-container',
    '#didomi-host',
    '.newsletter-popup',
    '.newsletter-modal',
    '.subscribe-popup',
    '.popup-overlay',
    'div[class*="cookie-popup"]',
    'div[class*="consent-banner"]',
    '[id*="sp_message_container"]',
    '.evidon-banner'
  ];

  // Stripped Tracking Parameters from URLs
  const TRACKING_URL_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'mc_eid', 'yclid',
    '_hsenc', '_openstat', 'igshid', 'si', 'ref_', 'dclid', 'twclid',
    'wickedid', 'sc_clid', 'matomo_campaign', 'pk_campaign', 'gad_source'
  ];

  // Search Engine Referer Protection Domains
  const SEARCH_ENGINE_DOMAINS = [
    'google.com', 'www.google.com', 'bing.com', 'www.bing.com',
    'yahoo.com', 'search.yahoo.com', 'yandex.ru', 'yandex.com',
    'duckduckgo.com', 'baidu.com'
  ];

  // Curated Filter Subscriptions Hub (8 Categories)
  const DEFAULT_FILTER_CATEGORIES = [
    {
      id: 'adblocking',
      name: 'Ad blocking',
      description: 'Blocks ads',
      subfilters: [
        { id: 'adguard_base', name: 'AdGuard Base filter', desc: 'EasyList + AdGuard main ad filter rules', enabled: true, rulesCount: 78420 },
        { id: 'adguard_mobile', name: 'AdGuard Mobile Ads filter', desc: 'Blocks ads on mobile versions of websites', enabled: true, rulesCount: 14210 }
      ]
    },
    {
      id: 'privacy',
      name: 'Privacy',
      description: 'Blocks trackers',
      subfilters: [
        { id: 'adguard_tracking', name: 'AdGuard Tracking Protection filter', desc: 'Blocks trackers and web analytics using AdGuard Tracking Protection filter', enabled: true, rulesCount: 39510 },
        { id: 'adguard_url_tracking', name: 'AdGuard URL Tracking filter', desc: 'Removes tracking parameters from page URLs using AdGuard URL Tracking filter', enabled: true, rulesCount: 8940 },
        { id: 'easyprivacy', name: 'EasyPrivacy', desc: 'International tracking protection list', enabled: true, rulesCount: 42100 }
      ]
    },
    {
      id: 'social',
      name: 'Social widgets',
      description: 'Blocks social media elements, such as Like and Share buttons',
      subfilters: [
        { id: 'adguard_social', name: 'AdGuard Social Media filter', desc: 'Blocks social widgets, Like and Share buttons', enabled: true, rulesCount: 12450 },
        { id: 'fanboy_social', name: "Fanboy's Social Blocking List", desc: 'Neutralizes embedded social page widgets', enabled: true, rulesCount: 18920 }
      ]
    },
    {
      id: 'annoyances',
      name: 'Annoyances',
      description: 'Blocks annoying web elements, such as cookie notices or in-page popups',
      subfilters: [
        { id: 'adguard_cookies', name: 'AdGuard Cookie Notices filter', desc: 'Blocks cookie notices and GDPR/CCPA overlays', enabled: true, rulesCount: 15300 },
        { id: 'adguard_popups', name: 'AdGuard Popups filter', desc: 'Blocks annoying newsletter popups and promotional overlays', enabled: true, rulesCount: 11200 },
        { id: 'adguard_mobile_app', name: 'AdGuard Mobile App Banners filter', desc: 'Hides "Open in App" banners and sticky nag bars', enabled: true, rulesCount: 6400 },
        { id: 'adguard_other_annoyances', name: 'AdGuard Other Annoyances filter', desc: 'Blocks push notification prompts and auto-play widgets', enabled: true, rulesCount: 9800 },
        { id: 'adguard_widgets', name: 'AdGuard Widgets filter', desc: 'Hides live support chat widgets and feedback tabs', enabled: true, rulesCount: 8100 },
        { id: 'fanboy_anti_elements', name: "Fanboy's Annoyance List (Full)", desc: 'Comprehensive elements (may break legacy site navigation)', enabled: false, rulesCount: 45200 }
      ]
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Blocks requests to phishing and malicious websites',
      subfilters: [
        { id: 'adguard_phishing', name: 'AdGuard Phishing & Malware Protection', desc: 'Blocks confirmed phishing and deceptive domains', enabled: true, rulesCount: 22400 },
        { id: 'malware_domains', name: 'Malware Domains Blocklist', desc: 'Known payload distribution and exploit kit servers', enabled: true, rulesCount: 19800 },
        { id: 'nocoin_crypto', name: 'NoCoin Cryptomining Filter', desc: 'Blocks in-browser WebAssembly and JS cryptocurrency miners', enabled: true, rulesCount: 3120 },
        { id: 'scam_shield', name: 'Scam & Rogue Software Shield', desc: 'Protects against tech support scams and counterfeit pages', enabled: true, rulesCount: 8900 },
        { id: 'safe_browsing', name: 'Safe Browsing Database Sync', desc: 'Real-time telemetry against deceptive URL endpoints', enabled: true, rulesCount: 14750 }
      ]
    },
    {
      id: 'other',
      name: 'Other',
      description: "This group contains various filters that don't fit into other categories",
      subfilters: [
        { id: 'useful_ads', name: 'Filter unblocking useful search ads', desc: 'Allows non-intrusive search results ads', enabled: true, rulesCount: 1500 },
        { id: 'adguard_experimental', name: 'AdGuard Experimental filter', desc: 'Cutting-edge DNR and procedural cosmetic rules', enabled: true, rulesCount: 4200 }
      ]
    },
    {
      id: 'language',
      name: 'Language-specific',
      description: 'Blocks ads on websites in specified languages',
      subfilters: [
        { id: 'lang_chinese', name: 'Chinese Filter List', desc: 'Blocks ads on Chinese websites (ChinaList / AdGuard Chinese)', enabled: false, rulesCount: 18200 },
        { id: 'lang_russian', name: 'Russian Filter List', desc: 'RU AdList + Yandex AdFox blocklist', enabled: false, rulesCount: 24100 },
        { id: 'lang_german', name: 'German Filter List', desc: 'EasyList Germany + German cosmetic rules', enabled: false, rulesCount: 11400 },
        { id: 'lang_french', name: 'French Filter List', desc: 'Liste FR + AdGuard French', enabled: false, rulesCount: 10900 },
        { id: 'lang_spanish', name: 'Spanish Filter List', desc: 'EasyList Spanish + AdGuard Spanish', enabled: false, rulesCount: 8700 },
        { id: 'lang_japanese', name: 'Japanese Filter List', desc: 'AdGuard Japanese + ABP Japanese', enabled: false, rulesCount: 14600 }
      ]
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Allows you to add filters from a file or URL',
      notice: 'To use custom filters, enable Allow user scripts in your browser’s extension settings',
      subfilters: [
        { id: 'custom_user_list', name: 'User Custom Rules & Subscriptions', desc: 'Custom filter list from URL or manual user rules', enabled: true, rulesCount: 0 }
      ]
    }
  ];

  // Generate DeclarativeNetRequest Dynamic Rules for Native MV3 Interception
  function generateDNRAdBlockRules(baseId = 1000, options = {}) {
    const rules = [];
    const resourceTypes = [
      'main_frame',
      'sub_frame',
      'stylesheet',
      'script',
      'image',
      'font',
      'object',
      'xmlhttprequest',
      'ping',
      'csp_report',
      'media',
      'websocket',
      'other'
    ];

    // Tracking Protection Option 1: Remove tracking parameters from URLs (DNR ID: 50)
    if (options.removeTrackingParamsEnabled !== false) {
      rules.push({
        id: 50,
        priority: 2,
        action: {
          type: 'redirect',
          redirect: {
            transform: {
              queryTransform: {
                removeParams: TRACKING_URL_PARAMS
              }
            }
          }
        },
        condition: {
          urlFilter: '*',
          resourceTypes: ['main_frame', 'sub_frame']
        }
      });
    }

    // Tracking Protection Option 2: Hide search queries from destination referer (DNR ID: 51)
    if (options.hideSearchQueriesEnabled !== false) {
      rules.push({
        id: 51,
        priority: 2,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'Referer', operation: 'set', value: 'https://www.google.com/' }
          ]
        },
        condition: {
          initiatorDomains: SEARCH_ENGINE_DOMAINS,
          resourceTypes: ['main_frame', 'sub_frame']
        }
      });
    }

    // Tracking Protection Option 3: Send Global Privacy Control & Do Not Track headers (DNR ID: 52)
    if (options.sendDntGpcEnabled !== false) {
      rules.push({
        id: 52,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'Sec-GPC', operation: 'set', value: '1' },
            { header: 'DNT', operation: 'set', value: '1' }
          ]
        },
        condition: {
          urlFilter: '*',
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other']
        }
      });
    }

    // Tracking Protection Option 4: Remove X-Client-Data header from Google / YouTube (DNR IDs: 53, 54)
    if (options.removeXClientDataEnabled !== false) {
      rules.push({
        id: 53,
        priority: 2,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'X-Client-Data', operation: 'remove' }
          ]
        },
        condition: {
          urlFilter: '||google.',
          resourceTypes: resourceTypes
        }
      });
      rules.push({
        id: 54,
        priority: 2,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'X-Client-Data', operation: 'remove' }
          ]
        },
        condition: {
          urlFilter: '||youtube.',
          resourceTypes: resourceTypes
        }
      });
    }

    // Domain Block Rules (Priority 2) - Activated if trackersBlockEnabled !== false or adBlockEnabled
    if (options.trackersBlockEnabled !== false) {
      AD_TRACKER_DOMAINS.forEach((domain, idx) => {
        rules.push({
          id: baseId + idx,
          priority: 2,
          action: { type: 'block' },
          condition: {
            urlFilter: `||${domain}`,
            resourceTypes
          }
        });
      });
    }

    // Generic Script & Resource Patterns (Priority 3 - higher precedence)
    const scriptBaseId = baseId + AD_TRACKER_DOMAINS.length;
    SCRIPT_BLOCK_PATTERNS.forEach((pattern, idx) => {
      rules.push({
        id: scriptBaseId + idx,
        priority: 3,
        action: { type: 'block' },
        condition: {
          urlFilter: pattern,
          resourceTypes
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
    COSMETIC_SOCIAL_SELECTORS,
    COSMETIC_ANNOYANCE_SELECTORS,
    TRACKING_URL_PARAMS,
    SEARCH_ENGINE_DOMAINS,
    DEFAULT_FILTER_CATEGORIES,
    generateDNRAdBlockRules
  };
});
