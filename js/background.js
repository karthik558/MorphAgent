// background.js - MorphAgent 4.0.2
// Universal Cross-Browser Background Engine (Chrome MV3 & Firefox MV2/MV3)

const api = typeof browser !== 'undefined' ? browser : chrome;

const UA_HEADER = 'User-Agent';
let cachedUA = typeof navigator !== 'undefined' ? navigator.userAgent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
let websiteRules = [];
let blockList = [];
let jsBlockEnabled = false;
let jsBlockedSites = [];
let jsProtectEnabled = true;
let uaSpoofEnabled = true;
let activeCategory = 'desktop';

console.log('[MorphAgent 4.0] Background engine starting...');

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
    if (!uaSpoofEnabled) {
      await api.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1] });
      console.log('[MorphAgent 4.0] UA Spoofing disabled; DNR rules cleared.');
      return;
    }

    const ch = getClientHintsHeaders(targetUA);
    const rules = [{
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
    }];

    await api.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: rules
    });
    console.log('[MorphAgent 4.0] DNR rules updated for UA & Headers:', targetUA);
  } catch (e) {
    console.warn('[MorphAgent 4.0] DNR update failed:', e);
  }
}

// Threat Analytics Storage Receiver
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log-threat' && message.data) {
    const threat = {
      timestamp: Date.now(),
      type: message.data.type,
      domain: message.data.domain,
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
    const syncData = await api.storage.sync.get(['websiteRules', 'blockList']);
    const localData = await api.storage.local.get(['selectedUA', 'jsBlockEnabled', 'jsProtectEnabled', 'uaSpoofEnabled', 'activeCategory']);

    websiteRules = syncData.websiteRules || [];
    blockList = syncData.blockList || [];
    jsBlockEnabled = !!localData.jsBlockEnabled;
    jsProtectEnabled = localData.jsProtectEnabled !== undefined ? !!localData.jsProtectEnabled : true;
    uaSpoofEnabled = localData.uaSpoofEnabled !== undefined ? !!localData.uaSpoofEnabled : true;
    activeCategory = localData.activeCategory || 'desktop';

    jsBlockedSites = websiteRules.filter(r => r.jsBlocked).map(r => r.website);

    if (localData.selectedUA) {
      cachedUA = localData.selectedUA;
    }

    updateBadge(cachedUA, activeCategory);
    updateDeclarativeNetRequestRules(cachedUA);

    console.log('[MorphAgent 4.0] Settings loaded:', {
      rulesCount: websiteRules.length,
      blockListCount: blockList.length,
      jsBlock: jsBlockEnabled,
      jsProtect: jsProtectEnabled,
      activeCategory
    });
  } catch (error) {
    console.error('[MorphAgent 4.0] Settings load error:', error);
  }
}

loadSettings();

// Listen for storage updates
api.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.websiteRules) {
      websiteRules = changes.websiteRules.newValue || [];
      jsBlockedSites = websiteRules.filter(r => r.jsBlocked).map(r => r.website);
    }
    if (changes.blockList) {
      blockList = changes.blockList.newValue || [];
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

    for (const blockItem of blockList) {
      if (matchesPattern(hostname, blockItem.website) || matchesPattern(url, blockItem.website)) {
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
    console.log('[MorphAgent 4.0] webRequest blocking listener skipped or MV3 active');
  }
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
      'uiState'
    ]).then(res => sendResponse(res))
      .catch(() => sendResponse({}));
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
        title: 'MorphAgent 4.0 Stealth',
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
        title: 'Add to Block List (Disable Spoofing)',
        contexts: ['all']
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
    console.warn('[MorphAgent 4.0] Context menu setup skipped:', e);
  }
}

if (api.runtime.onInstalled) {
  api.runtime.onInstalled.addListener(() => {
    setupContextMenus();
  });
} else {
  setupContextMenus();
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

    if (info.menuItemId === 'morph-agent-settings') {
      if (api.tabs && api.tabs.create) {
        api.tabs.create({ url: api.runtime.getURL('advanced-settings.html') });
      }
    } else if (info.menuItemId === 'morph-agent-spoof-location' || info.menuItemId === 'morph-agent-block-js' || info.menuItemId === 'morph-agent-block-site') {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('moz-extension://') || tab.url.startsWith('about:')) return;
      try {
        const hostname = new URL(tab.url).hostname;

        if (info.menuItemId === 'morph-agent-block-site') {
          api.storage.sync.get(['blockList']).then(res => {
            const list = res.blockList || [];
            if (!list.find(b => b.website === hostname)) {
              list.push({ id: Date.now(), website: hostname });
              api.storage.sync.set({ blockList: list }).then(() => {
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
        console.log('[MorphAgent 4.0 Ghost Mode] Automatically rotated User Agent:', randomUA.title);
      });
    }
  });
}