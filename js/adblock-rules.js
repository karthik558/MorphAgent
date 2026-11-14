// adblock-rules.js - MorphAgent 4.8.2
// Universal High-Efficiency Ad, Tracker, Telemetry & DNS Rule Engine
// Bundled network and cosmetic rules for MV3 DeclarativeNetRequest

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

  // Bundled Ad, Tracking, Telemetry & Fingerprinting Domain List
  const AD_TRACKER_DOMAINS = [
    // Dedicated advertising hosts (domain rules also cover their subdomains).
    'ads.reddit.com',
    'connatix.com',
    'fls-na.amazon.com',
    'ad.mail.ru',
    'target.my.com',
    'tags.crwdcntrl.net',
    'trackcmp.net',
    'fwmrm.net',
    'imasdk.googleapis.com',
    'bat.bing.com',
    'posthog.com',
    'logx.optimizely.com',
    'ads-dev.pinterest.com',
    'advertising.twitter.com',
    'ads.facebook.com',
    'affiliationjs.s3.amazonaws.com',
    'ads.google.com',
    'hotjar-analytics.com',
    'crypto-loot.org',
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

  // Legacy webRequest patterns. MV3 uses the bounded script conditions below.
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
  ];

  // CSS Selectors for Bundled Cosmetic Element Hiding
  const COSMETIC_AD_SELECTORS = [
    // Standard Google / AdSense / DFP Units
    '.adsbygoogle',
    '.banner_ad',
    '.banner-728x90',
    '#ad-300x250',
    '#ad-leaderboard',
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
    '_hsenc', '_openstat', 'igshid', 'dclid', 'twclid',
    'wickedid', 'sc_clid', 'matomo_campaign', 'pk_campaign', 'gad_source'
  ];

  // Search Engine Referer Protection Domains
  const SEARCH_ENGINE_DOMAINS = [
    'google.com', 'www.google.com', 'bing.com', 'www.bing.com',
    'yahoo.com', 'search.yahoo.com', 'yandex.ru', 'yandex.com',
    'duckduckgo.com', 'baidu.com'
  ];

  // Each visible switch owns a real bundled group, not a remote subscription.
  const TRACKER_DOMAINS = AD_TRACKER_DOMAINS.filter(domain =>
    /analytics|tracking|telemetry|metrics|metrika|sentry|bugsnag|hotjar|clarity|segment|mixpanel|amplitude|chartbeat|newrelic|nr-data|mouseflow|fullstory|logrocket|posthog|fingerprint|scorecard|quantserve|quantcount|statcounter|heapanalytics|google.*tagmanager|bat[.]bing[.]com|logx[.]optimizely[.]com|crwdcntrl|trackcmp/.test(domain));
  const MINER_DOMAINS = ['coinhive.com', 'crypto-loot.com', 'crypto-loot.org', 'webminepool.com', 'jsecoin.com', 'minr.pw', 'coin-have.com', 'authedmine.com', 'mineralt.io'];
  const AD_DOMAINS = [...new Set(AD_TRACKER_DOMAINS)].filter(domain => !TRACKER_DOMAINS.includes(domain) && !MINER_DOMAINS.includes(domain));
  // Match script path components, never filenames embedded in query strings.
  // Generic app filenames are only blocked inside an explicit ad directory.
  const AD_SCRIPT_CONDITIONS = [
    { regexFilter: '^https?://[^/?#]+/([^?#]*/)?(ads|pagead|adsbygoogle|show_ads|advertisement)([.]min)?[.]js([?#]|$)', resourceTypes: ['script'] },
    { regexFilter: '^https?://[^/?#]+/([^?#]*/)?(ad|ads|advertising|pagead)/([^?#]*/)?(index|add)([.]min)?[.]js([?#]|$)', resourceTypes: ['script'] },
    // Ad endpoints on shared content hosts: retain normal playback and assets.
    ...['||wl.spotify.com/adtrack^', '||vid.vidyard.com/ads^', '||redditstatic.com/ads^'].map(urlFilter => ({ urlFilter, resourceTypes: ['script', 'image', 'xmlhttprequest', 'ping', 'media', 'other'] })),
    // Ad-named banner assets, including fetch probes and legacy Flash files.
    ...['pr_advertising_ads_banner', 'advertising_ads_banner', 'ad_banner', 'ads_banner'].map(name => ({
      regexFilter: `^https?://[^?#]+/${name}[.](png|gif|jpg|jpeg|webp|avif|swf)([?#]|$)`,
      resourceTypes: ['image', 'object', 'xmlhttprequest', 'other']
    }))
  ];
  const FILTER_GROUPS = {
    ads: { domains: [
      // WHOX pool hosts also present as unconditional host rules in EasyList/EasyPrivacy (2026-11-14).
      'a-mo.net', 'a-mx.com', 'ad-delivery.net',
      'ad-srv.net', 'adiquity.com', 'adkernel.com',
      'admedo.com', 'admission.net', 'adreadytractions.com',
      'adsafety.net', 'adviva.net', 'aimatch.com',
      'ampxchange.com', 'awltovhc.com', 'bizographics.com',
      'browsiprod.com', 'clickagy.com', 'convertexperiments.com',
      'creativecdn.com', 'ebuzzing.com', 'exdynsrv.com',
      'fksnk.com', 'goutee.top', 'greystripe.com',
      'hilltopads.net', 'hotwords.com', 'htlbid.com',
      'iprom.net', 'js7k.com', 'ligatus.com',
      'lzjl.com', 'maxbounty.com', 'ml314.com',
      'msads.net', 'peer39.net', 'perfectmarket.com',
      'pointroll.com', 'polarmobile.com', 'precisionclick.com',
      'pro-market.net', 'prosperent.com', 'qnsr.com',
      'qwtag.com', 'radiusmarketing.com', 'rlcdn.com',
      'securedvisit.com', 'smilewanted.com', 'sparkstudios.com',
      'sportradarserving.com', 'stackadapt.com', 'technoratimedia.com',
      'yieldbuild.com', 'yieldlab.net', 'zatnoh.com',
      ...AD_DOMAINS, 'adtago.s3.amazonaws.com', 'analyticsengine.s3.amazonaws.com',
      'analytics.s3.amazonaws.com', 'advice-ads.s3.amazonaws.com', 'analytics.microsoft.com',
      'bingads.microsoft.com', 'adsdk.microsoft.com', 'msadsscale.microsoft.com',
      'adserver.yahoo.com', 'beap-bc.yahoo.com', 'app.ssp.yahoo.com',
      'js-sec.indexww.com', 'app.adjust.net', 'app.adjust.world',
      'cdn-settings.appsflyersdk.com', 'inapps.appsflyersdk.com', 'mediation.unity3d.com',
      'collect.analytics.unity3d.com', 'init.supersonicads.com', 'outcome-ssp.supersonicads.com',
      'sdk-events.inner-active.mobi', 'cdn2.inner-active.mobi', 'ads.nexage.com',
      'net.rayjump.com', 'setting.rayjump.com', 'detect.rayjump.com',
      'i.l.inmobicdn.net', 'bs.yandex.ru', 'adsdk.yandex.ru',
      'hm.baidu.com', 'eclick.baidu.com', 'cpro.baidu.com',
      'pos.baidu.com', 'dup.baidustatic.com', 'mobads.baidu.com',
      'nsclick.baidu.com', 'cpro.baidustatic.com', 'tajs.qq.com',
      'pingjs.qq.com', 'e.qq.com', 'acjs.aliyun.com',
      'atanx.alicdn.com', 'beacon.qq.com', 'gdt.qq.com',
      'dorangesource.alicdn.com', 'adcr.naver.com', 'wcs.naver.net',
      'adimg3.search.naver.net', 'display.ad.daum.net', 'track.tiara.daum.net',
      'app-tracking-gfa-collector.naver.com', 'event.impression-neo.naver.com', 'cafe-ads-api.daum.net',
      'adtimaserver.vn', 'top-fwz1.mail.ru', 'rs.mail.ru',
      'vk-ads.com', 'ads.iheart.com', 'ads.soundcloud.com',
      'ads.deezer.com', 'ads.tritondigital.com', 'synchroscript.adswizz.com',
      'adsserver.megaphone.fm', 'ads.freewheel.tv', 'api.content-ad.net',
      's.ntv.io', '3lift.com', 'edge.supersonicads.com',
      'admob.googleapis.com', 'adsrvr.org'
    ], selectors: COSMETIC_AD_SELECTORS, conditions: AD_SCRIPT_CONDITIONS },
    trackers: { domains: [
      // WHOX pool hosts also present as unconditional host rules in EasyList/EasyPrivacy (2026-11-14).
      'adrtx.net', 'ambiguousafternoon.com', 'awarealley.com',
      'bagbeam.com', 'bleachbubble.com', 'bluekai.com',
      'bounceexchange.com', 'bustlingbook.com', 'cautiouscherries.com',
      'celestialspectra.com', 'childlikecrowd.com', 'circlelevel.com',
      'cleanhaircut.com', 'colossalcoat.com', 'combcattle.com',
      'conditioncrush.com', 'crimsonmeadow.com', 'cutechin.com',
      'damagedadvice.com', 'delicatecascade.com', 'dq95d35.com',
      'ethereallagoon.com', 'farmergoldfish.com', 'farsnails.com',
      'fcmatch.youtube.com', 'fearlessfaucet.com', 'floors.dev',
      'flutteringfireman.com', 'futuristicframe.com', 'fuzzybasketball.com',
      'giddycoat.com', 'giraffepiano.com', 'gondolagnome.com',
      'handyfireman.com', 'haplessland.com', 'hsadspixel.net',
      'hystericalcloth.com', 'inconclusiveaction.com', 'lovelydrum.com',
      'marketspiders.com', 'mdhv.io', 'mentorsticks.com',
      'nappyneck.com', 'oafishchance.com', 'optimallimit.com',
      'pleasantpump.com', 'politeplanes.com', 'puffypurpose.com',
      'railwayreason.com', 'rebelswing.com', 'reconditerespect.com',
      'rehabilitatereason.com', 's-onetag.com', 'serv1swork.com',
      'shrillspoon.com', 'skisofa.com', 'slinksuggestion.com',
      'soggysponge.com', 'songsterritory.com', 'spookyexchange.com',
      'stereoproxy.com', 'swankysquare.com', 'teenytinyshirt.com',
      'tncid.app', 'trackersimulator.org', 'unablehope.com',
      'unwieldyplastic.com', 'voraciousgrip.com', 'wantingwindow.com',
      'zlp6s.pw',
      ...new Set(TRACKER_DOMAINS), 'assets.adobedtm.com', 'dpm.demdex.net',
      'fast.demdex.net', 'cm.everesttech.net', 'adobedc.demdex.net',
      'sstats.adobe.com', 'events.segmentapis.com', 'cdn.mxpnl.com',
      'upload.luckyorange.net', 'cs.luckyorange.net', 'settings.luckyorange.net',
      'plausible.io', 'matomo.cloud', 'stats.wp.com',
      'analytics.facebook.com', 'mon.tiktokv.com', 'analytics.us.tiktok.com',
      'log.tiktokv.com', 'xlog.tiktokv.com', 'xlog-va.tiktokv.com',
      'ads-api.twitter.com', 'ads.linkedin.com', 'analytics.pointdrive.linkedin.com',
      'events.reddit.com', 'pixel.reddit.com', 'pixel.redditmedia.com',
      'tracker.redditmedia.com', 'ads.snapchat.com', 'adsapi.snapchat.com',
      'app-analytics.snapchat.com', 'q.quora.com', 'ads-api.nextdoor.com',
      'pixel.nextdoor.com', 'tracking.nextdoor.com', 'us-tracking.nextdoor.com',
      'sentry.io', 'browser-intake-datadoghq.com', 'browser-intake-datadoghq.eu',
      'api.rollbar.com', 'browser-intake-us5-datadoghq.com', 'api.raygun.io',
      'cdn.logrocket.io', 'api.ad.xiaomi.com', 'data.mistat.xiaomi.com',
      'data.mistat.india.xiaomi.com', 'data.mistat.rus.xiaomi.com', 'sdkconfig.ad.xiaomi.com',
      'sdkconfig.ad.intl.xiaomi.com', 'tracking.rus.miui.com', 'tracking.miui.com',
      'adv.sec.intl.miui.com', 'samsungads.com', 'smetrics.samsung.com',
      'nmetrics.samsung.com', 'samsung-com.112.2o7.net', 'analytics-api.samsunghealthcn.com',
      'log-config.samsungacr.com', 'ads.samsung.com', 'analytics.bigdata.samsung.com',
      'metrics.data.hicloud.com', 'metrics2.data.hicloud.com', 'logservice.hicloud.com',
      'logservice1.hicloud.com', 'logbak.hicloud.com', 'adsfs.oppomobile.com',
      'adx.ads.oppomobile.com', 'ck.ads.oppomobile.com', 'data.ads.oppomobile.com',
      'iot-eu-logser.realme.com', 'bdapi-ads.realmemobile.com', 'click.oneplus.cn',
      'iadsdk.apple.com', 'api-adservices.apple.com', 'metrics.icloud.com',
      'metrics.mzstatic.com', 'books-analytics-events.apple.com', 'weather-analytics-events.apple.com',
      'notes-analytics-events.apple.com', 'securemetrics.apple.com', 'news-events.apple.com',
      'stocks-analytics-events.apple.com', 'ads.roku.com', 'scribe.logs.roku.com',
      'pixel.web.roku.com', 'us.info.lgsmartad.com', 'ad.lgappstv.com',
      'tvinteractive.tv', 'tags.bluekai.com', 'id5-sync.com',
      'cdn.imrworldwide.com', 'idsync.rlcdn.com', 'aa.agkn.com',
      'pixel.tapad.com', 'idsync.drawbrid.ge', 'va.vercel-scripts.com',
      'c.go-mpulse.net', 'www.fastly-insights.com', 'cdn.quantummetric.com',
      'lux.speedcurve.com'
    ], selectors: [], conditions: [
      ...['||vk.com/rtrg^', '||facebook.com/tr^', '||s.pinimg.com/ct/core.js^'].map(urlFilter => ({urlFilter, resourceTypes:['script','image','xmlhttprequest','ping','other']})),
      {regexFilter: '^https?://[^/?#]+/([^?#]*/)?analytics([.]min)?[.]js([?#]|$)', resourceTypes:['script']}
    ] },
    miners: { domains: MINER_DOMAINS, selectors: [] },
    social: { domains: [], selectors: COSMETIC_SOCIAL_SELECTORS },
    'shared-services': { domains: [
      'redirector.googlevideo.com', 'graph.facebook.com', 'graph.instagram.com',
      'i.instagram.com', 'ssl.p.jwpcdn.com', 'linksynergy.com',
      'skimresources.com', 'bnc.lt', 'dpbolvw.net',
      'awin1.com', 'impactradius-event.com', 'anrdoezrs.net',
      'tkqlhce.com', 'sdk.privacy-center.org', 'app.usercentrics.eu',
      'geolocation.onetrust.com', 'cdn.privacy-mgmt.com', 'consent.trustarc.com',
      'cdn.cookielaw.org', 'privacyportal.onetrust.com', 'cookiebot.com', 'consent.cookiebot.com',
      'cmp.osano.com', 'shareasale.com', 'prf.hn',
      't.pepperjamnetwork.com', 'go.redirectingat.com', 'cdn.optimizely.com',
      'api.optimizely.com', 'cdn.onesignal.com', 'api.onesignal.com',
      'customer.io', 'www.cj.com', 'www.zanox-affiliate.de',
      'ad.zanox.com', 'tradedoubler.com', 'track.webgains.com',
      'track.webgains.org', 't.myvisualiq.net', 'www.emjcd.com',
      'impact.com', 'cookie-cdn.cookiepro.com', 'smetrics.onetrust.com',
      'quantcast.mgr.consensu.org', 'sourcepoint.mgr.consensu.org', 'api.privacy-center.org'
    ], selectors: [] },
    annoyances: { domains: [], selectors: COSMETIC_ANNOYANCE_SELECTORS }
  };
  const DEFAULT_FILTER_CATEGORIES = [
    {
      id: 'adblocking', name: 'Ad blocking', description: 'Bundled ad domains and page elements', subfilters: [
        { id: 'ads', name: 'Ads and sponsored content', desc: 'Network ads and cosmetic filters, including Google and YouTube ad elements', enabled: true }
      ]
    },
    {
      id: 'privacy', name: 'Privacy', description: 'Bundled analytics protection', subfilters: [
        { id: 'trackers', name: 'Analytics and trackers', desc: 'Known tracking domains; also requires Block trackers above', enabled: true }
      ]
    },
    {
      id: 'security', name: 'Security', description: 'Bundled mining domain protection', subfilters: [
        { id: 'miners', name: 'Cryptomining domains', desc: 'Blocks known in-browser mining services', enabled: true }
      ]
    },
    {
      id: 'social', name: 'Social widgets', description: 'Optional page element hiding', subfilters: [
        { id: 'social', name: 'Social sharing widgets', desc: 'Hide embedded Like and Share widgets', enabled: false }
      ]
    },
    {
      id: 'shared-services', name: 'Strict service blocking', description: 'Blocks shared video/social APIs, affiliate redirects and consent services; may break site features', subfilters: [
        { id: 'shared-services', name: 'Block shared, affiliate and consent services', desc: 'Maximum host blocking. May break playback, login, shopping links and consent dialogs. Disable this group or pause the site if needed.', enabled: true }
      ]
    },
    {
      id: 'annoyances', name: 'Annoyances', description: 'Optional page element hiding', subfilters: [
        { id: 'annoyances', name: 'Cookie notices and newsletter popups', desc: 'Hides notices without granting consent; some pages may remain locked', enabled: false }
      ]
    }
  ];
  for (const cat of DEFAULT_FILTER_CATEGORIES) for (const sub of cat.subfilters) {
    const group = FILTER_GROUPS[sub.id];
    sub.rulesCount = group.domains.length + group.selectors.length + (group.conditions?.length || 0);
  }
  function filterEnabled(state, id) {
    const defaults = DEFAULT_FILTER_CATEGORIES.flatMap(cat => cat.subfilters);
    const saved = Array.isArray(state) ? state.flatMap(cat => Array.isArray(cat?.subfilters) ? cat.subfilters : []).find(sub => sub?.id === id) : null;
    return typeof saved?.enabled === 'boolean' ? saved.enabled : defaults.find(sub => sub.id === id)?.enabled === true;
  }
  function cosmeticSelectors(options = {}, hostname = '') {
    if (options.adBlockEnabled === false || options.adBlockCosmeticEnabled === false) return [];
    const selectors = Object.entries(FILTER_GROUPS).flatMap(([id, group]) => filterEnabled(options.filtersState, id) ? group.selectors : []);
    if (filterEnabled(options.filtersState, 'ads') && /^(www\.)?google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(hostname)) {
      selectors.push('#tads', '#tadsb', '#bottomads', '[data-text-ad]', '[data-sponsored]');
    }
    return selectors;
  }

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
            { header: 'Referer', operation: 'remove' }
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

    let id = baseId;
    for (const [name, group] of Object.entries(FILTER_GROUPS)) {
      if (options.adBlockEnabled === false || options.adBlockNetworkEnabled === false || !filterEnabled(options.filtersState, name)) continue;
      if (name === 'trackers' && options.trackersBlockEnabled === false) continue;
      for (const domain of group.domains) rules.push({
        id: id++, priority: 2, action: { type: 'block' },
        condition: { urlFilter: `||${domain}^`, resourceTypes }
      });
      for (const condition of group.conditions || []) rules.push({
        id: id++, priority: 2, action: { type: 'block' }, condition: { ...condition }
      });
    }

    return rules;
  }

  return {
    filterEnabled,
    cosmeticSelectors,
    FILTER_GROUPS,
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
