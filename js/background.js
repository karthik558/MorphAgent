// background.js - MorphAgent 4.0.0
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
          { header: 'Sec-CH-UA-Platform', operation: 'set', value: ch.secChUaPlatform }
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
    console.log('[MorphAgent 4.0] Chrome DNR rules updated successfully for target UA');
  } catch (err) {
    console.warn('[MorphAgent 4.0] DNR update error:', err);
  }
}

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
        return rule.userAgent;
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
  }
});

// Setup Context Menus
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
        id: 'morph-agent-mobile',
        parentId: 'morph-agent-root',
        title: 'Switch to iPhone 17 Pro Max',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-desktop',
        parentId: 'morph-agent-root',
        title: 'Switch to Chrome 145 (Desktop)',
        contexts: ['all']
      });

      api.contextMenus.create({
        id: 'morph-agent-settings',
        parentId: 'morph-agent-root',
        title: 'Open Advanced Settings & Builder...',
        contexts: ['all']
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

if (api.contextMenus && api.contextMenus.onClicked) {
  api.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'morph-agent-mobile') {
      const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1';
      api.storage.local.set({ selectedUA: mobileUA, activeCategory: 'mobile', touchSpoofEnabled: true, maxTouchPoints: 5 });
    } else if (info.menuItemId === 'morph-agent-desktop') {
      const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';
      api.storage.local.set({ selectedUA: desktopUA, activeCategory: 'desktop', touchSpoofEnabled: false, maxTouchPoints: 0 });
    } else if (info.menuItemId === 'morph-agent-settings') {
      if (api.tabs && api.tabs.create) {
        api.tabs.create({ url: api.runtime.getURL('advanced-settings.html') });
      }
    }
  });
}