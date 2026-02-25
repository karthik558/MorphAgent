// background.js
// Persistent background script for Firefox Manifest V2

const UA_HEADER = 'User-Agent';
let cachedUA = navigator.userAgent; // Default to browser UA
let websiteRules = [];
let blockList = [];
let jsBlockEnabled = false; // Global JS blocking toggle
let jsBlockedSites = []; // Per-site JS blocking from website rules
let jsProtectEnabled = false; // Global JS detection protection toggle

console.log('[UserAgent Extension] Service worker loaded. Default UA:', cachedUA);

// Load initial settings from storage
async function loadSettings() {
  try {
    const syncData = await browser.storage.sync.get(['websiteRules', 'blockList']);
    const localData = await browser.storage.local.get(['selectedUA', 'jsBlockEnabled', 'jsProtectEnabled']);
    
    websiteRules = syncData.websiteRules || [];
    blockList = syncData.blockList || [];
    jsBlockEnabled = !!localData.jsBlockEnabled;
    jsProtectEnabled = !!localData.jsProtectEnabled;
    
    // Build list of sites with JS blocking from website rules
    jsBlockedSites = websiteRules.filter(r => r.jsBlocked).map(r => r.website);
    
    if (localData.selectedUA) {
      cachedUA = localData.selectedUA;
      console.log('[UserAgent Extension] Loaded UA from storage:', cachedUA);
    }
    
    console.log('[UserAgent Extension] Loaded settings:', {
      websiteRules: websiteRules.length,
      blockList: blockList.length,
      jsBlockEnabled: jsBlockEnabled,
      jsBlockedSites: jsBlockedSites.length,
      jsProtectEnabled: jsProtectEnabled
    });
  } catch (error) {
    console.error('[UserAgent Extension] Error loading settings:', error);
  }
}

// Initialize settings
loadSettings();

// Listen for storage changes
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.websiteRules) {
      websiteRules = changes.websiteRules.newValue || [];
      jsBlockedSites = websiteRules.filter(r => r.jsBlocked).map(r => r.website);
      console.log('[UserAgent Extension] Website rules updated:', websiteRules.length);
    }
    if (changes.blockList) {
      blockList = changes.blockList.newValue || [];
      console.log('[UserAgent Extension] Block list updated:', blockList.length);
    }
  }
  if (areaName === 'local') {
    if (changes.selectedUA) {
      cachedUA = changes.selectedUA.newValue;
      console.log('[UserAgent Extension] Global UA updated:', cachedUA);
    }
    if (changes.jsBlockEnabled !== undefined) {
      jsBlockEnabled = !!changes.jsBlockEnabled.newValue;
      console.log('[UserAgent Extension] JS blocking updated:', jsBlockEnabled);
    }
    if (changes.jsProtectEnabled !== undefined) {
      jsProtectEnabled = !!changes.jsProtectEnabled.newValue;
      console.log('[UserAgent Extension] JS protection updated:', jsProtectEnabled);
    }
  }
});

// Check if URL matches pattern
function matchesPattern(url, pattern) {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special characters
    .replace(/\*/g, '.*'); // Convert * to .*
  
  try {
    const regex = new RegExp(regexPattern, 'i');
    return regex.test(url);
  } catch (error) {
    console.warn('[UserAgent Extension] Invalid pattern:', pattern, error);
    return false;
  }
}

// Get user agent for specific URL
function getUserAgentForUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check if URL is in block list
    for (const blockItem of blockList) {
      if (matchesPattern(hostname, blockItem.website) || matchesPattern(url, blockItem.website)) {
        console.log('[UserAgent Extension] URL in block list, using default UA:', url);
        return navigator.userAgent; // Return original browser UA
      }
    }
    
    // Check for website-specific rules
    for (const rule of websiteRules) {
      if (matchesPattern(hostname, rule.website) || matchesPattern(url, rule.website)) {
        console.log('[UserAgent Extension] Using custom UA for', hostname, ':', rule.userAgent);
        return rule.userAgent;
      }
    }
    
    // Use global UA
    return cachedUA;
  } catch (error) {
    console.error('[UserAgent Extension] Error processing URL:', url, error);
    return cachedUA;
  }
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-settings') {
    browser.storage.local.get(['selectedUA', 'maxTouchPoints', 'touchSpoofEnabled', 'jsBlockEnabled', 'jsProtectEnabled']).then(sendResponse);
    return true;
  } else if (message.type === 'set-settings') {
    browser.storage.local.set(message.data).then(() => {
      if (message.data.selectedUA) {
        cachedUA = message.data.selectedUA;
        console.log('[UserAgent Extension] UA updated from popup:', cachedUA);
      }
      if (message.data.jsBlockEnabled !== undefined) {
        jsBlockEnabled = !!message.data.jsBlockEnabled;
        console.log('[UserAgent Extension] JS blocking updated from popup:', jsBlockEnabled);
      }
      if (message.data.jsProtectEnabled !== undefined) {
        jsProtectEnabled = !!message.data.jsProtectEnabled;
        console.log('[UserAgent Extension] JS protection updated from popup:', jsProtectEnabled);
      }
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === 'get-tab-settings') {
    // Get all active tabs and check which ones have custom UA settings
    browser.tabs.query({}).then(tabs => {
      const tabSettings = [];
      
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('moz-extension://') && !tab.url.startsWith('about:')) {
          try {
            const url = new URL(tab.url);
            const hostname = url.hostname;
            
            // Check if this hostname has a custom rule
            const matchingRule = websiteRules.find(rule => {
              return matchesPattern(hostname, rule.website) || matchesPattern(tab.url, rule.website);
            });
            
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
          } catch (error) {
            // Skip invalid URLs
          }
        }
      });
      
      sendResponse(tabSettings);
    }).catch(error => {
      console.error('Failed to get tab settings:', error);
      sendResponse([]);
    });
    return true;
  }
});

// Intercept all outgoing requests to set User-Agent
browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    const targetUA = getUserAgentForUrl(details.url);
    
    let headers = details.requestHeaders.filter(h => h.name.toLowerCase() !== UA_HEADER.toLowerCase());
    headers.push({ name: UA_HEADER, value: targetUA });
    
    // Only log if UA is different from default to reduce console spam
    if (targetUA !== navigator.userAgent) {
      console.log('[UserAgent Extension] Intercepted request to', details.url, 'Setting UA:', targetUA);
    }
    
    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

// Check if JavaScript should be blocked for a given URL
function shouldBlockJavaScript(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check site-specific JS blocking rules first
    for (const rule of websiteRules) {
      if (rule.jsBlocked && (matchesPattern(hostname, rule.website) || matchesPattern(url, rule.website))) {
        return true;
      }
    }
    
    // Check global JS blocking
    return jsBlockEnabled;
  } catch (error) {
    return jsBlockEnabled;
  }
}

// Intercept script requests to block JavaScript
browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (shouldBlockJavaScript(details.url)) {
      // Don't block extension's own scripts
      if (details.url.startsWith('moz-extension://') || details.url.startsWith('chrome-extension://')) {
        return {};
      }
      
      console.log('[UserAgent Extension] Blocked script:', details.url);
      return { cancel: true };
    }
    return {};
  },
  { urls: ["<all_urls>"], types: ["script"] },
  ["blocking"]
); 