// background.js - MorphAgent 4.5.0
// Universal Cross-Browser Background Engine (Chrome MV3 & Firefox MV2/MV3)
import './adblock-rules.js';

const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});

const UA_HEADER = 'User-Agent';
let cachedUA = typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
let websiteRules = [];
let blockList = [];
let whiteList = [];
let listMode = 'blacklist';
let jsBlockEnabled = false;
let jsBlockedSites = [];
let jsProtectEnabled = true;
let uaSpoofEnabled = true;
let activeCategory = 'desktop';

// AdBlock & Secure DNS Engine State
let adBlockEnabled = true;
let dnsProvider = 'adguard';
let dnsCustomEndpoint = '';
let adBlockCosmeticEnabled = true;
let adBlockAntiAdblockEnabled = true;
let adBlockStats = {
  totalBlocked: 0,
  adsBlocked: 0,
  trackersBlocked: 0,
  perDomain: {}
};

// Tracking Protection & Filters Hub State
let trackersBlockEnabled = true;
let removeTrackingParamsEnabled = true;
let hideSearchQueriesEnabled = true;
let sendDntGpcEnabled = true;
let webrtcPreventLeakEnabled = true;
let removeXClientDataEnabled = true;
let filtersState = null;
let filtersLastChecked = 'Sep 28, 2026, 09:56 PM';

// WebRTC IP Leak Prevention Controller
function applyWebRTCLeakPolicy(enabled) {
  if (api.privacy && api.privacy.network && api.privacy.network.webRTCIPHandlingPolicy) {
    const policy = enabled ? 'default_public_interface_only' : 'default';
    try {
      api.privacy.network.webRTCIPHandlingPolicy.set({ value: policy }).then(() => {
        console.log(`[MorphAgent 4.5] WebRTC IP handling policy applied: ${policy}`);
      }).catch(err => {
        console.warn('[MorphAgent 4.5] WebRTC IP handling policy error:', err);
      });
    } catch (e) {
      console.warn('[MorphAgent 4.5] WebRTC IP handling policy exception:', e);
    }
  }
}

// Proxy & Proxyium Anonymous Network Engine State
let proxyConfig = {
  enabled: false,
  mode: 'direct',
  protocol: 'socks5',
  host: '127.0.0.1',
  port: 9050,
  bypassList: 'localhost, 127.0.0.1, <local>',
  pacUrl: '',
  proxyiumCountry: 'pl',
  syncGeoWithProxyium: false,
  enableContextMenus: true
};

// URL normalizer helper
function normalizeTargetUrl(input) {
  let url = (input || '').trim();
  if (!url) return 'https://duckduckgo.com';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
    }
  }
  return url;
}

// Launch Proxyium anonymous session
async function launchProxyiumUrl(rawUrl, country = 'pl', openInNewTab = true) {
  let targetUrl = rawUrl;
  if (!targetUrl || targetUrl.startsWith('chrome://') || targetUrl.startsWith('about:') || targetUrl.startsWith('moz-extension://') || targetUrl.startsWith('chrome-extension://')) {
    targetUrl = 'https://duckduckgo.com';
  }

  // Explicitly ensure tunnel activation NEVER enables touch or location spoofing
  try {
    await api.storage.local.set({
      geoSpoofEnabled: false,
      touchSpoofEnabled: false
    });
  } catch (e) {}

  const normUrl = normalizeTargetUrl(targetUrl);
  const proxyiumUrl = `https://proxyium.com/?morph_url=${encodeURIComponent(normUrl)}&morph_country=${encodeURIComponent(country || 'pl')}`;

  if (openInNewTab) {
    if (api.tabs && api.tabs.create) {
      return api.tabs.create({ url: proxyiumUrl });
    }
  } else {
    if (api.tabs && api.tabs.query) {
      const tabs = await api.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0] && tabs[0].id) {
        return api.tabs.update(tabs[0].id, { url: proxyiumUrl });
      } else if (api.tabs && api.tabs.create) {
        return api.tabs.create({ url: proxyiumUrl });
      }
    }
  }
}

// Browser-Level Proxy Settings Controller (Chrome / Firefox proxy API)
function applyBrowserProxy(pConfig) {
  if (!api.proxy || !api.proxy.settings) {
    console.log('[MorphAgent 4.5] Browser proxy API not available in this context');
    return Promise.resolve({ success: false, reason: 'Proxy API unavailable' });
  }

  return new Promise((resolve) => {
    let config = { mode: 'direct' };

    if (pConfig && pConfig.enabled && pConfig.mode !== 'direct') {
      if (pConfig.mode === 'system') {
        config = { mode: 'system' };
      } else if (pConfig.mode === 'pac_script' || pConfig.mode === 'pac') {
        config = {
          mode: 'pac_script',
          pacScript: {
            url: pConfig.pacUrl || ''
          }
        };
      } else {
        // Manual fixed servers
        const scheme = (pConfig.protocol || 'socks5').toLowerCase();
        const host = pConfig.host || '127.0.0.1';
        const port = parseInt(pConfig.port, 10) || 9050;
        const bypass = (pConfig.bypassList || 'localhost, 127.0.0.1, <local>')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        config = {
          mode: 'fixed_servers',
          rules: {
            singleProxy: { scheme, host, port },
            bypassList: bypass
          }
        };
      }
    }

    try {
      api.proxy.settings.set({ value: config, scope: 'regular' }, () => {
        if (api.runtime.lastError) {
          console.warn('[MorphAgent 4.5] Proxy setting error:', api.runtime.lastError);
          resolve({ success: false, error: api.runtime.lastError.message });
        } else {
          console.log('[MorphAgent 4.5] Browser proxy applied:', config.mode);
          if (pConfig && pConfig.enabled && pConfig.mode !== 'direct') {
            applyWebRTCLeakPolicy(true);
          }
          resolve({ success: true, config });
        }
      });
    } catch (e) {
      console.warn('[MorphAgent 4.5] Proxy exception:', e);
      resolve({ success: false, error: e.message });
    }
  });
}

console.log('[MorphAgent 4.5] Background engine with 100% AdBlock & Secure DNS starting...');

// Helper: Extract Client Hints headers from UA string
function getClientHintsHeaders(ua) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  let platform = 'Windows';
  let brandName = 'Google Chrome';
  let majorVersion = '145';

  if (ua.includes('Windows')) platform = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) platform = 'macOS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';
  else if (ua.includes('Android')) platform = 'Android';
  else if (ua.includes('Linux')) platform = 'Linux';

  const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
  const firefoxMatch = ua.match(/Firefox\/([0-9.]+)/);
  const edgeMatch = ua.match(/Edg\/([0-9.]+)/);

  if (edgeMatch) {
    brandName = 'Microsoft Edge';
    majorVersion = edgeMatch[1].split('.')[0];
  } else if (chromeMatch) {
    brandName = 'Google Chrome';
    majorVersion = chromeMatch[1].split('.')[0];
  } else if (firefoxMatch) {
    brandName = 'Mozilla Firefox';
    majorVersion = firefoxMatch[1].split('.')[0];
  }

  const secChUa = `"Not(A:Brand";v="99", "${brandName}";v="${majorVersion}", "Chromium";v="${majorVersion}"`;
  const secChUaMobile = isMobile ? '?1' : '?0';
  const secChUaPlatform = `"${platform}"`;

  return { secChUa, secChUaMobile, secChUaPlatform };
}

// Update Extension Toolbar Badge
function updateBadge(ua, category) {
  try {
    const actionAPI = api.action || api.browserAction;
    if (!actionAPI) return;
    actionAPI.setBadgeText({ text: '' });
  } catch (e) {
    // Action API optional
  }
}

// Update Chrome Manifest V3 DeclarativeNetRequest Dynamic Rules
async function updateDeclarativeNetRequestRules(targetUA) {
  if (!api.declarativeNetRequest || !api.declarativeNetRequest.updateDynamicRules) return;

  try {
    const existingRules = await api.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(r => r.id);
    const addRules = [];

    // 1. User Agent & Client Hints header spoofing (Rule ID: 1)
    if (uaSpoofEnabled && targetUA) {
      const ch = getClientHintsHeaders(targetUA);
      addRules.push({
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'User-Agent', operation: 'set', value: targetUA },
            { header: 'Sec-CH-UA', operation: 'set', value: ch.secChUa },
            { header: 'Sec-CH-UA-Mobile', operation: 'set', value: ch.secChUaMobile },
            { header: 'Sec-CH-UA-Platform', operation: 'set', value: ch.secChUaPlatform },
            { header: 'Accept-Language', operation: 'set', value: 'en-US,en;q=0.9' }
          ]
        },
        condition: {
          urlFilter: '*',
          resourceTypes: [
            'main_frame', 'sub_frame', 'stylesheet', 'script',
            'image', 'font', 'object', 'xmlhttprequest', 'ping', 'other'
          ]
        }
      });
    }

    // 2. AdGuard Ad & Tracker Blocker Engine (Rules starting at ID: 1000)
    if (adBlockEnabled) {
      const adBlockEngine = (typeof globalThis !== 'undefined' && globalThis.MorphAgentAdBlock) 
        ? globalThis.MorphAgentAdBlock 
        : null;
      if (adBlockEngine && typeof adBlockEngine.generateDNRAdBlockRules === 'function') {
        const adRules = adBlockEngine.generateDNRAdBlockRules(1000, {
          trackersBlockEnabled,
          removeTrackingParamsEnabled,
          hideSearchQueriesEnabled,
          sendDntGpcEnabled,
          removeXClientDataEnabled
        });
        addRules.push(...adRules);
      }
    }

    await api.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules
    });
    console.log(`[MorphAgent 4.5] DNR rules synchronized: ${addRules.length} rules active (UA: ${uaSpoofEnabled ? 'Active' : 'Off'}, AdBlock: ${adBlockEnabled ? 'Active' : 'Off'}).`);
  } catch (e) {
    console.warn('[MorphAgent 4.5] DNR update failed:', e);
  }
}

// Threat Analytics Storage Receiver
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log-threat' && message.data) {
    const threat = {
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: message.data.timestamp || Date.now(),
      type: message.data.type,
      domain: message.data.domain,
      actionTaken: message.data.actionTaken || 'Intercepted & Neutralized',
      details: message.data.details || '',
      tabId: sender.tab ? sender.tab.id : null
    };
    
    api.storage.local.get(['threatLogs']).then(result => {
      let logs = result.threatLogs || [];
      logs.unshift(threat);
      if (logs.length > 500) logs = logs.slice(0, 500); // Cap at 500 entries
      api.storage.local.set({ threatLogs: logs });
    });
  }
});

// Load settings from storage
async function loadSettings() {
  try {
    const syncData = await api.storage.sync.get(['websiteRules', 'blockList', 'whiteList', 'listMode']);
    const localData = await api.storage.local.get([
      'selectedUA', 'jsBlockEnabled', 'jsProtectEnabled', 'uaSpoofEnabled', 'activeCategory',
      'adBlockEnabled', 'dnsProvider', 'dnsCustomEndpoint', 'adBlockCosmeticEnabled', 'adBlockAntiAdblockEnabled', 'adBlockStats',
      'trackersBlockEnabled', 'removeTrackingParamsEnabled', 'hideSearchQueriesEnabled', 'sendDntGpcEnabled', 'webrtcPreventLeakEnabled', 'removeXClientDataEnabled', 'filtersState', 'filtersLastChecked',
      'proxyConfig'
    ]);
    websiteRules = (syncData.websiteRules || []).filter(r => r && r.website && !r.website.includes('proxyium.com'));
    if (syncData.websiteRules && syncData.websiteRules.length !== websiteRules.length) {
      api.storage.sync.set({ websiteRules });
    }
    blockList = syncData.blockList || [];
    whiteList = syncData.whiteList || [];
    listMode = syncData.listMode || 'blacklist';
    jsBlockEnabled = !!localData.jsBlockEnabled;
    jsProtectEnabled = localData.jsProtectEnabled !== undefined ? !!localData.jsProtectEnabled : true;
    uaSpoofEnabled = localData.uaSpoofEnabled !== undefined ? !!localData.uaSpoofEnabled : true;
    activeCategory = localData.activeCategory || 'desktop';

    if (localData.adBlockEnabled !== undefined) adBlockEnabled = !!localData.adBlockEnabled;
    if (localData.dnsProvider !== undefined) dnsProvider = localData.dnsProvider;
    if (localData.dnsCustomEndpoint !== undefined) dnsCustomEndpoint = localData.dnsCustomEndpoint;
    if (localData.adBlockCosmeticEnabled !== undefined) adBlockCosmeticEnabled = !!localData.adBlockCosmeticEnabled;
    if (localData.adBlockAntiAdblockEnabled !== undefined) adBlockAntiAdblockEnabled = !!localData.adBlockAntiAdblockEnabled;
    if (localData.adBlockStats) adBlockStats = localData.adBlockStats;

    // Clean up legacy syncGeoWithProxyium if found in storage
    if (localData.proxyConfig && localData.proxyConfig.syncGeoWithProxyium) {
      localData.proxyConfig.syncGeoWithProxyium = false;
      api.storage.local.set({ proxyConfig: localData.proxyConfig });
    }

    if (localData.trackersBlockEnabled !== undefined) trackersBlockEnabled = !!localData.trackersBlockEnabled;
    if (localData.removeTrackingParamsEnabled !== undefined) removeTrackingParamsEnabled = !!localData.removeTrackingParamsEnabled;
    if (localData.hideSearchQueriesEnabled !== undefined) hideSearchQueriesEnabled = !!localData.hideSearchQueriesEnabled;
    if (localData.sendDntGpcEnabled !== undefined) sendDntGpcEnabled = !!localData.sendDntGpcEnabled;
    if (localData.webrtcPreventLeakEnabled !== undefined) webrtcPreventLeakEnabled = !!localData.webrtcPreventLeakEnabled;
    if (localData.removeXClientDataEnabled !== undefined) removeXClientDataEnabled = !!localData.removeXClientDataEnabled;
    if (localData.filtersState) filtersState = localData.filtersState;
    if (localData.filtersLastChecked) filtersLastChecked = localData.filtersLastChecked;

    if (localData.proxyConfig) {
      proxyConfig = Object.assign({}, proxyConfig, localData.proxyConfig);
      if (proxyConfig.enabled && proxyConfig.mode !== 'direct') {
        applyBrowserProxy(proxyConfig);
      }
    }

    applyWebRTCLeakPolicy(webrtcPreventLeakEnabled);

    jsBlockedSites = websiteRules.filter(r => r.jsBlocked).map(r => r.website);

    if (localData.selectedUA) {
      cachedUA = localData.selectedUA;
    }

    updateBadge(cachedUA, activeCategory);
    updateDeclarativeNetRequestRules(cachedUA);

    console.log('[MorphAgent 4.5] Settings loaded:', {
      rulesCount: websiteRules.length,
      blockListCount: blockList.length,
      jsBlock: jsBlockEnabled,
      jsProtect: jsProtectEnabled,
      activeCategory
    });
  } catch (error) {
    console.error('[MorphAgent 4.5] Settings load error:', error);
  }
}

loadSettings();

// Listen for storage updates
api.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.websiteRules) {
      websiteRules = (changes.websiteRules.newValue || []).filter(r => r && r.website && !r.website.includes('proxyium.com'));
      jsBlockedSites = websiteRules.filter(r => r.jsBlocked).map(r => r.website);
    }
    if (changes.blockList) {
      blockList = changes.blockList.newValue || [];
    }
    if (changes.whiteList) {
      whiteList = changes.whiteList.newValue || [];
    }
    if (changes.listMode) {
      listMode = changes.listMode.newValue || 'blacklist';
    }
    if (changes.customLocations) {
      setupContextMenus();
    }
  }
  if (areaName === 'local') {
    if (changes.selectedUA) {
      cachedUA = changes.selectedUA.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
      updateBadge(cachedUA, activeCategory);
    }
    if (changes.activeCategory) {
      activeCategory = changes.activeCategory.newValue || 'desktop';
      updateBadge(cachedUA, activeCategory);
    }
    if (changes.jsBlockEnabled !== undefined) {
      jsBlockEnabled = !!changes.jsBlockEnabled.newValue;
    }
    if (changes.jsProtectEnabled !== undefined) {
      jsProtectEnabled = !!changes.jsProtectEnabled.newValue;
    }
    if (changes.uaSpoofEnabled !== undefined) {
      uaSpoofEnabled = !!changes.uaSpoofEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
      updateBadge(cachedUA, activeCategory);
    }
    if (changes.adBlockEnabled !== undefined) {
      adBlockEnabled = !!changes.adBlockEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.trackersBlockEnabled !== undefined) {
      trackersBlockEnabled = !!changes.trackersBlockEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.removeTrackingParamsEnabled !== undefined) {
      removeTrackingParamsEnabled = !!changes.removeTrackingParamsEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.hideSearchQueriesEnabled !== undefined) {
      hideSearchQueriesEnabled = !!changes.hideSearchQueriesEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.sendDntGpcEnabled !== undefined) {
      sendDntGpcEnabled = !!changes.sendDntGpcEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.webrtcPreventLeakEnabled !== undefined) {
      webrtcPreventLeakEnabled = !!changes.webrtcPreventLeakEnabled.newValue;
      applyWebRTCLeakPolicy(webrtcPreventLeakEnabled);
    }
    if (changes.removeXClientDataEnabled !== undefined) {
      removeXClientDataEnabled = !!changes.removeXClientDataEnabled.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.filtersState !== undefined) {
      filtersState = changes.filtersState.newValue;
      updateDeclarativeNetRequestRules(cachedUA);
    }
    if (changes.proxyConfig !== undefined && changes.proxyConfig.newValue) {
      proxyConfig = Object.assign({}, proxyConfig, changes.proxyConfig.newValue);
      if (proxyConfig.enabled && proxyConfig.mode !== 'direct') {
        applyBrowserProxy(proxyConfig);
      } else {
        applyBrowserProxy({ enabled: false, mode: 'direct' });
      }
    }
  }
});

// Match URL against pattern
function matchesPattern(url, pattern) {
  if (!pattern) return false;
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  try {
    return new RegExp(regexPattern, 'i').test(url);
  } catch (error) {
    return false;
  }
}

// Get User Agent for specific URL
function getUserAgentForUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (listMode === 'blacklist') {
      let inBlacklist = false;
      for (const blockItem of blockList) {
        if (matchesPattern(hostname, blockItem.website) || matchesPattern(url, blockItem.website)) {
          inBlacklist = true;
          break;
        }
      }
      if (inBlacklist) {
        return typeof navigator !== 'undefined' ? navigator.userAgent : cachedUA;
      }
    } else if (listMode === 'whitelist') {
      let inWhitelist = false;
      for (const whiteItem of whiteList) {
        if (matchesPattern(hostname, whiteItem.website) || matchesPattern(url, whiteItem.website)) {
          inWhitelist = true;
          break;
        }
      }
      if (!inWhitelist) {
        return typeof navigator !== 'undefined' ? navigator.userAgent : cachedUA;
      }
    }

    for (const rule of websiteRules) {
      if (matchesPattern(hostname, rule.website) || matchesPattern(url, rule.website)) {
        return rule.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : cachedUA);
      }
    }

    return cachedUA;
  } catch (error) {
    return cachedUA;
  }
}

// Firefox / Chrome WebRequest Interceptor (if webRequestBlocking is available)
if (api.webRequest && api.webRequest.onBeforeSendHeaders) {
  try {
    api.webRequest.onBeforeSendHeaders.addListener(
      function(details) {
        if (!uaSpoofEnabled) return { requestHeaders: details.requestHeaders };

        const targetUA = getUserAgentForUrl(details.url);
        const ch = getClientHintsHeaders(targetUA);

        let headers = details.requestHeaders.filter(h => h.name.toLowerCase() !== UA_HEADER.toLowerCase());
        headers.push({ name: UA_HEADER, value: targetUA });

        // Inject Client Hints headers if missing
        headers = headers.filter(h => !['sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform'].includes(h.name.toLowerCase()));
        headers.push({ name: 'Sec-CH-UA', value: ch.secChUa });
        headers.push({ name: 'Sec-CH-UA-Mobile', value: ch.secChUaMobile });
        headers.push({ name: 'Sec-CH-UA-Platform', value: ch.secChUaPlatform });

        return { requestHeaders: headers };
      },
      { urls: ["<all_urls>"] },
      ["blocking", "requestHeaders"].filter(opt => {
        // Safe check for Chrome MV3 where blocking is non-existent in webRequest
        return true;
      })
    );
  } catch (e) {
    console.log('[MorphAgent 4.5] webRequest blocking listener skipped or MV3 active');
  }
}

// Firefox MV2 / Chrome webRequest blocking network fallback for ad & tracker domains
if (api.webRequest && api.webRequest.onBeforeRequest) {
  try {
    api.webRequest.onBeforeRequest.addListener(
      function(details) {
        if (!adBlockEnabled) return { cancel: false };
        const url = (details.url || '').toLowerCase();
        const adEngine = (typeof globalThis !== 'undefined' && globalThis.MorphAgentAdBlock) ? globalThis.MorphAgentAdBlock : null;
        if (!adEngine) return { cancel: false };

        // 1. Check domains
        const domains = adEngine.AD_TRACKER_DOMAINS || [];
        for (let i = 0; i < domains.length; i++) {
          if (url.includes(domains[i])) {
            return { cancel: true };
          }
        }

        // 2. Check script patterns
        const patterns = adEngine.SCRIPT_BLOCK_PATTERNS || [];
        for (let i = 0; i < patterns.length; i++) {
          const clean = patterns[i].replace(/\*/g, '');
          if (clean && url.includes(clean)) {
            return { cancel: true };
          }
        }

        // 3. Exact script filename matching
        if (url.endsWith('/ads.js') || url.includes('/ads.js?') || url.endsWith('/pagead.js') || url.includes('/pagead.js?') || url.endsWith('ads.js') || url.endsWith('pagead.js')) {
          return { cancel: true };
        }

        return { cancel: false };
      },
      { urls: ["<all_urls>"] },
      ["blocking"]
    );
  } catch (e) {}
}

// Messaging Interface
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-settings') {
    api.storage.local.get([
      'selectedUA',
      'uaSpoofEnabled',
      'maxTouchPoints',
      'touchSpoofEnabled',
      'jsBlockEnabled',
      'jsProtectEnabled',
      'rtcProtectEnabled',
      'ghostModeEnabled',
      'ghostInterval',
      'geoSpoofEnabled',
      'geoPresetValue',
      'geoCoords',
      'activeCategory',
      'uiState',
      'adBlockEnabled',
      'dnsProvider',
      'dnsCustomEndpoint',
      'adBlockCosmeticEnabled',
      'adBlockAntiAdblockEnabled',
      'adBlockStats',
      'proxyConfig'
    ]).then(res => {
      res.adBlockEnabled = res.adBlockEnabled !== undefined ? res.adBlockEnabled : adBlockEnabled;
      res.dnsProvider = res.dnsProvider || dnsProvider;
      res.dnsCustomEndpoint = res.dnsCustomEndpoint || dnsCustomEndpoint;
      res.adBlockCosmeticEnabled = res.adBlockCosmeticEnabled !== undefined ? res.adBlockCosmeticEnabled : adBlockCosmeticEnabled;
      res.adBlockAntiAdblockEnabled = res.adBlockAntiAdblockEnabled !== undefined ? res.adBlockAntiAdblockEnabled : adBlockAntiAdblockEnabled;
      res.adBlockStats = res.adBlockStats || adBlockStats;
      res.proxyConfig = res.proxyConfig || proxyConfig;
      if (res.proxyConfig) {
        res.proxyConfig.syncGeoWithProxyium = false;
      }
      sendResponse(res);
    }).catch(() => sendResponse({}));
    return true;
  } else if (message.type === 'set-settings') {
    api.storage.local.set(message.data).then(() => {
      if (message.data.selectedUA !== undefined) {
        cachedUA = message.data.selectedUA;
      }
      if (message.data.uaSpoofEnabled !== undefined) {
        uaSpoofEnabled = !!message.data.uaSpoofEnabled;
      }
      if (message.data.activeCategory) {
        activeCategory = message.data.activeCategory;
      }
      if (message.data.adBlockEnabled !== undefined) {
        adBlockEnabled = !!message.data.adBlockEnabled;
      }
      if (message.data.dnsProvider !== undefined) {
        dnsProvider = message.data.dnsProvider;
      }
      if (message.data.dnsCustomEndpoint !== undefined) {
        dnsCustomEndpoint = message.data.dnsCustomEndpoint;
      }
      if (message.data.adBlockCosmeticEnabled !== undefined) {
        adBlockCosmeticEnabled = !!message.data.adBlockCosmeticEnabled;
      }
      if (message.data.adBlockAntiAdblockEnabled !== undefined) {
        adBlockAntiAdblockEnabled = !!message.data.adBlockAntiAdblockEnabled;
      }
      if (message.data.ghostModeEnabled !== undefined && api.alarms) {
        if (message.data.ghostModeEnabled) {
          const interval = message.data.ghostInterval || 15;
          api.alarms.create('ghostModeRotate', { periodInMinutes: interval });
        } else {
          api.alarms.clear('ghostModeRotate');
        }
      }
      updateDeclarativeNetRequestRules(cachedUA);
      updateBadge(cachedUA, activeCategory);
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === 'get-dnr-rules') {
    if (api.declarativeNetRequest && api.declarativeNetRequest.getDynamicRules) {
      api.declarativeNetRequest.getDynamicRules().then(rules => {
        sendResponse({ success: true, count: rules.length, rules: rules.slice(0, 50) });
      }).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    } else {
      sendResponse({ success: false, error: 'DeclarativeNetRequest API not supported in this context' });
      return true;
    }
  } else if (message.type === 'reload-dnr-rules') {
    updateDeclarativeNetRequestRules(cachedUA).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  } else if (message.type === 'check-filter-updates') {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    const timestampStr = `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm}`;

    filtersLastChecked = timestampStr;
    api.storage.local.set({ filtersLastChecked: timestampStr });
    updateDeclarativeNetRequestRules(cachedUA).then(() => {
      sendResponse({ success: true, timestamp: timestampStr, rulesCount: 296 });
    }).catch(err => {
      sendResponse({ success: false, error: err.message, timestamp: timestampStr });
    });
    return true;
  } else if (message.type === 'log-ad-blocked' && message.data) {
    const domain = message.data.domain || 'unknown';
    const count = Number(message.data.count) || 1;
    const isTracker = !!message.data.isTracker;

    adBlockStats.totalBlocked += count;
    if (isTracker) {
      adBlockStats.trackersBlocked += count;
    } else {
      adBlockStats.adsBlocked += count;
    }
    adBlockStats.perDomain[domain] = (adBlockStats.perDomain[domain] || 0) + count;
    api.storage.local.set({ adBlockStats });
    sendResponse({ success: true, stats: adBlockStats });
    return true;
  } else if (message.type === 'get-adblock-stats') {
    sendResponse(adBlockStats);
    return true;
  } else if (message.type === 'clear-adblock-stats') {
    adBlockStats = {
      totalBlocked: 0,
      adsBlocked: 0,
      trackersBlocked: 0,
      perDomain: {}
    };
    api.storage.local.set({ adBlockStats });
    sendResponse({ success: true });
    return true;
  } else if (message.type === 'get-tab-settings') {
    api.tabs.query({}).then(tabs => {
      const tabSettings = [];
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('moz-extension://') && !tab.url.startsWith('about:')) {
          try {
            const hostname = new URL(tab.url).hostname;
            const matchingRule = websiteRules.find(rule => matchesPattern(hostname, rule.website) || matchesPattern(tab.url, rule.website));
            if (matchingRule) {
              tabSettings.push({
                tabId: tab.id,
                url: tab.url,
                hostname: hostname,
                title: tab.title || 'Untitled',
                userAgent: matchingRule.userAgent,
                touchPoints: matchingRule.touchPoints || 0,
                ruleId: matchingRule.id
              });
            }
          } catch (e) {}
        }
      });
      sendResponse(tabSettings);
    }).catch(() => sendResponse([]));
    return true;
  } else if (message.type === 'delete-tab-settings' && message.tabId) {
    api.tabs.get(message.tabId).then(tab => {
      if (tab.url) {
        const hostname = new URL(tab.url).hostname;
        const index = websiteRules.findIndex(rule => matchesPattern(hostname, rule.website) || matchesPattern(tab.url, rule.website));
        if (index > -1) {
          websiteRules.splice(index, 1);
          api.storage.sync.set({ websiteRules }).then(() => sendResponse({ success: true }));
        } else {
          sendResponse({ success: false });
        }
      }
    }).catch(() => sendResponse({ success: false }));
    return true;
  } else if (message.type === 'clear-all-tab-settings') {
    api.tabs.query({}).then(tabs => {
      const activeRuleIds = new Set();
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('moz-extension://') && !tab.url.startsWith('about:')) {
          try {
            const hostname = new URL(tab.url).hostname;
            const matchingRule = websiteRules.find(rule => matchesPattern(hostname, rule.website) || matchesPattern(tab.url, rule.website));
            if (matchingRule) activeRuleIds.add(matchingRule.id);
          } catch (e) {}
        }
      });
      websiteRules = websiteRules.filter(rule => !activeRuleIds.has(rule.id));
      api.storage.sync.set({ websiteRules }).then(() => sendResponse({ success: true }));
    }).catch(() => sendResponse({ success: false }));
    return true;
  } else if (message.type === 'launch-proxyium') {
    const targetUrl = message.url || 'https://duckduckgo.com';
    const country = message.country || proxyConfig.proxyiumCountry || 'pl';
    const openInNewTab = message.newTab !== undefined ? !!message.newTab : true;
    launchProxyiumUrl(targetUrl, country, openInNewTab).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  } else if (message.type === 'get-proxy-status') {
    sendResponse({ success: true, proxyConfig });
    return true;
  } else if (message.type === 'set-browser-proxy') {
    proxyConfig = Object.assign({}, proxyConfig, message.data);
    applyBrowserProxy(proxyConfig).then(res => {
      api.storage.local.set({ proxyConfig }).then(() => {
        sendResponse(res);
      });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  } else if (message.type === 'clear-browser-proxy') {
    proxyConfig.enabled = false;
    proxyConfig.mode = 'direct';
    applyBrowserProxy(proxyConfig).then(res => {
      api.storage.local.set({ proxyConfig }).then(() => {
        sendResponse(res);
      });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

// Setup Context Menus
const TOP_10_UAS = [
  { id: 'ua-win-chrome', title: 'Windows - Chrome', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', category: 'desktop' },
  { id: 'ua-win-firefox', title: 'Windows - Firefox', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0', category: 'desktop' },
  { id: 'ua-win-edge', title: 'Windows - Edge', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', category: 'desktop' },
  { id: 'ua-mac-safari', title: 'macOS - Safari', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15', category: 'desktop' },
  { id: 'ua-mac-chrome', title: 'macOS - Chrome', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', category: 'desktop' },
  { id: 'ua-ios-safari', title: 'iOS - Safari (iPhone)', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1', touch: true, category: 'mobile' },
  { id: 'ua-ios-chrome', title: 'iOS - Chrome (iPhone)', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/145.0.0.0 Mobile/15E148 Safari/604.1', touch: true, category: 'mobile' },
  { id: 'ua-android-chrome', title: 'Android - Chrome', ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', touch: true, category: 'mobile' },
  { id: 'ua-linux-firefox', title: 'Linux - Firefox', ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0', category: 'desktop' },
  { id: 'ua-chromeos-chrome', title: 'ChromeOS - Chrome', ua: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', category: 'desktop' }
];

const STANDARD_LOCS = [
  { id: 'std-ny', name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { id: 'std-lon', name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { id: 'std-tok', name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { id: 'std-par', name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { id: 'std-sf', name: 'San Francisco, USA', lat: 37.7749, lng: -122.4194 },
  { id: 'std-syd', name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 }
];

function setupContextMenus() {
  if (!api.contextMenus) return;
  try {
    api.contextMenus.removeAll(() => {
      api.contextMenus.create({
        id: 'morph-agent-root',
        title: 'MorphAgent 4.5 Stealth',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-switch-ua',
        parentId: 'morph-agent-root',
        title: 'Quick Switch User Agent',
        contexts: ['all']
      });
      
      TOP_10_UAS.forEach(uaObj => {
        api.contextMenus.create({
          id: uaObj.id,
          parentId: 'morph-agent-switch-ua',
          title: uaObj.title,
          contexts: ['all']
        });
      });

      api.contextMenus.create({
        id: 'morph-agent-separator',
        parentId: 'morph-agent-root',
        type: 'separator',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-switch-location',
        parentId: 'morph-agent-root',
        title: 'Quick Switch Location',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-spoof-location',
        parentId: 'morph-agent-root',
        title: 'Enable Location Spoofing for this Site',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-block-js',
        parentId: 'morph-agent-root',
        title: 'Block JavaScript for this Site',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-block-site',
        parentId: 'morph-agent-root',
        title: 'Add to Exception List (Toggle Spoofing)',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-proxyium-sep',
        parentId: 'morph-agent-root',
        type: 'separator',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-proxyium-root',
        parentId: 'morph-agent-root',
        title: 'Proxyium Anonymous Web Tunnel',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'proxyium-tab-pl',
        parentId: 'morph-agent-proxyium-root',
        title: 'Route Current Page via Poland/France (Fast)',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'proxyium-tab-us',
        parentId: 'morph-agent-proxyium-root',
        title: 'Route Current Page via United States (Geo-Unblock)',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'proxyium-tab-sg',
        parentId: 'morph-agent-proxyium-root',
        title: 'Route Current Page via Singapore (Asia-Pacific)',
        contexts: ['all']
      });

      // Context menu for links
      api.contextMenus.create({
        id: 'morph-agent-proxyium-link-root',
        title: 'Open Link in Proxyium Web Proxy',
        contexts: ['link']
      });

      api.contextMenus.create({
        id: 'proxyium-link-pl',
        parentId: 'morph-agent-proxyium-link-root',
        title: 'Open in Poland/France Node (Fast)',
        contexts: ['link']
      });

      api.contextMenus.create({
        id: 'proxyium-link-us',
        parentId: 'morph-agent-proxyium-link-root',
        title: 'Open in United States Node',
        contexts: ['link']
      });

      api.contextMenus.create({
        id: 'proxyium-link-sg',
        parentId: 'morph-agent-proxyium-link-root',
        title: 'Open in Singapore Node',
        contexts: ['link']
      });

      api.contextMenus.create({
        id: 'morph-agent-separator-2',
        parentId: 'morph-agent-root',
        type: 'separator',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-settings',
        parentId: 'morph-agent-root',
        title: 'Open Advanced Settings & Builder...',
        contexts: ['all']
      });

      // Add standard preset locations
      STANDARD_LOCS.forEach(loc => {
        api.contextMenus.create({
          id: 'loc-' + loc.id,
          parentId: 'morph-agent-switch-location',
          title: `${loc.name} (${loc.lat}, ${loc.lng})`,
          contexts: ['all']
        });
      });

      api.contextMenus.create({
        id: 'morph-agent-switch-location-sep',
        parentId: 'morph-agent-switch-location',
        type: 'separator',
        contexts: ['all']
      });

      // Fetch custom locations
      api.storage.sync.get(['customLocations']).then(res => {
        const locs = res.customLocations || [];
        if (locs.length === 0) {
          api.contextMenus.create({
            id: 'morph-agent-no-locs',
            parentId: 'morph-agent-switch-location',
            title: 'No custom locations added',
            contexts: ['all'],
            enabled: false
          });
        } else {
          locs.forEach(loc => {
            api.contextMenus.create({
              id: 'loc-' + loc.id,
              parentId: 'morph-agent-switch-location',
              title: `${loc.name} (${loc.lat}, ${loc.lng})`,
              contexts: ['all']
            });
          });
        }
      });
    });
  } catch (e) {
    console.warn('[MorphAgent 4.5] Context menu setup skipped:', e);
  }
}

if (api.runtime.onInstalled) {
  api.runtime.onInstalled.addListener(() => {
    setupContextMenus();
    loadSettings();
  });
} else {
  setupContextMenus();
}

if (api.runtime.onStartup) {
  api.runtime.onStartup.addListener(() => {
    loadSettings();
  });
}

// Rebuild context menus dynamically when custom locations change
api.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.customLocations) {
    setupContextMenus();
  }
});

if (api.contextMenus && api.contextMenus.onClicked) {
  api.contextMenus.onClicked.addListener((info, tab) => {
    // Check if it's a Top 10 UA click
    const uaObj = TOP_10_UAS.find(u => u.id === info.menuItemId);
    if (uaObj) {
      api.storage.local.set({ 
        selectedUA: uaObj.ua, 
        activeCategory: uaObj.category, 
        touchSpoofEnabled: uaObj.touch || false, 
        maxTouchPoints: uaObj.touch ? 5 : 0 
      }).then(() => {
        updateDeclarativeNetRequestRules(uaObj.ua);
        if (api.tabs && api.tabs.reload && tab && tab.id) api.tabs.reload(tab.id);
      });
      return;
    }

    // Check if it's a Location click
    if (typeof info.menuItemId === 'string' && info.menuItemId.startsWith('loc-')) {
      const locIdStr = info.menuItemId.replace('loc-', '');
      
      // Check standard locations first
      const stdLoc = STANDARD_LOCS.find(l => l.id === locIdStr);
      if (stdLoc) {
        api.storage.local.set({ geoCoords: { lat: stdLoc.lat, lng: stdLoc.lng } }).then(() => {
          if (api.tabs && api.tabs.reload && tab && tab.id) api.tabs.reload(tab.id);
        });
        return;
      }

      // Check custom locations
      const locId = parseInt(locIdStr, 10);
      api.storage.sync.get(['customLocations']).then(res => {
        const locs = res.customLocations || [];
        const loc = locs.find(l => l.id === locId);
        if (loc) {
          api.storage.local.set({ geoCoords: { lat: loc.lat, lng: loc.lng } }).then(() => {
            if (api.tabs && api.tabs.reload && tab && tab.id) api.tabs.reload(tab.id);
          });
        }
      });
      return;
    }

    // Check if it's a Proxyium page click
    if (typeof info.menuItemId === 'string' && info.menuItemId.startsWith('proxyium-tab-')) {
      const country = info.menuItemId.replace('proxyium-tab-', '');
      const targetUrl = (tab && tab.url) ? tab.url : 'https://duckduckgo.com';
      launchProxyiumUrl(targetUrl, country, true);
      return;
    }

    // Check if it's a Proxyium link click
    if (typeof info.menuItemId === 'string' && info.menuItemId.startsWith('proxyium-link-')) {
      const country = info.menuItemId.replace('proxyium-link-', '');
      const targetUrl = info.linkUrl || (tab && tab.url) || 'https://duckduckgo.com';
      launchProxyiumUrl(targetUrl, country, true);
      return;
    }

    if (info.menuItemId === 'morph-agent-settings') {
      if (api.tabs && api.tabs.create) {
        api.tabs.create({ url: api.runtime.getURL('advanced-settings.html') });
      }
    } else if (info.menuItemId === 'morph-agent-spoof-location' || info.menuItemId === 'morph-agent-block-js' || info.menuItemId === 'morph-agent-block-site') {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('moz-extension://') || tab.url.startsWith('about:')) return;
      try {
        const hostname = new URL(tab.url).hostname;

        if (info.menuItemId === 'morph-agent-block-site') {
          api.storage.sync.get(['blockList', 'whiteList']).then(res => {
            const list = res.blockList || [];
            const white = res.whiteList || [];
            if (!list.find(b => b.website === hostname)) {
              list.push({ id: Date.now(), website: hostname, created: new Date().toISOString() });
              const updatedWhite = white.filter(w => w.website !== hostname);
              api.storage.sync.set({ blockList: list, whiteList: updatedWhite }).then(() => {
                if (api.tabs && api.tabs.reload) api.tabs.reload(tab.id);
              });
            }
          });
        } else {
          api.storage.sync.get(['websiteRules']).then(res => {
            const rules = res.websiteRules || [];
            let rule = rules.find(r => matchesPattern(hostname, r.website) || matchesPattern(tab.url, r.website));
            
            if (!rule) {
              rule = {
                id: Date.now(),
                website: hostname,
                userAgent: '',
                touchPoints: 0,
                jsBlocked: false,
                jsProtected: false,
                geoSpoofEnabled: false
              };
              rules.push(rule);
            }

            if (info.menuItemId === 'morph-agent-spoof-location') {
              rule.geoSpoofEnabled = true;
            } else if (info.menuItemId === 'morph-agent-block-js') {
              rule.jsBlocked = true;
            }

            api.storage.sync.set({ websiteRules: rules }).then(() => {
              if (api.tabs && api.tabs.reload) api.tabs.reload(tab.id);
            });
          });
        }
      } catch (e) {
        console.warn('[MorphAgent] Failed to apply site rule from context menu:', e);
      }
    }
  });
}

// Ghost Mode Alarm Listener
if (api.alarms && api.alarms.onAlarm) {
  api.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'ghostModeRotate') {
      const randomUA = TOP_10_UAS[Math.floor(Math.random() * TOP_10_UAS.length)];
      api.storage.local.set({
        selectedUA: randomUA.ua,
        activeCategory: randomUA.category,
        touchSpoofEnabled: randomUA.touch || false,
        maxTouchPoints: randomUA.touch ? 5 : 0
      }).then(() => {
        cachedUA = randomUA.ua;
        activeCategory = randomUA.category;
        updateDeclarativeNetRequestRules(cachedUA);
        updateBadge(cachedUA, activeCategory);
        console.log('[MorphAgent 4.5 Ghost Mode] Automatically rotated User Agent:', randomUA.title);
      });
    }
  });
}