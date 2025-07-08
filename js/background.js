// background.js
// Persistent background script for Firefox Manifest V2

const UA_HEADER = 'User-Agent';
let cachedUA = navigator.userAgent; // Default to browser UA
let websiteRules = [];
let blockList = [];

console.log('[UserAgent Extension] Service worker loaded. Default UA:', cachedUA);

// Load initial settings from storage
async function loadSettings() {
  try {
    const syncData = await browser.storage.sync.get(['websiteRules', 'blockList']);
    const localData = await browser.storage.local.get(['selectedUA']);
    
    websiteRules = syncData.websiteRules || [];
    blockList = syncData.blockList || [];
    
    if (localData.selectedUA) {
      cachedUA = localData.selectedUA;
      console.log('[UserAgent Extension] Loaded UA from storage:', cachedUA);
    }
    
    console.log('[UserAgent Extension] Loaded settings:', {
      websiteRules: websiteRules.length,
      blockList: blockList.length
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
      console.log('[UserAgent Extension] Website rules updated:', websiteRules.length);
    }
    if (changes.blockList) {
      blockList = changes.blockList.newValue || [];
      console.log('[UserAgent Extension] Block list updated:', blockList.length);
    }
  }
  if (areaName === 'local' && changes.selectedUA) {
    cachedUA = changes.selectedUA.newValue;
    console.log('[UserAgent Extension] Global UA updated:', cachedUA);
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
    browser.storage.local.get(['selectedUA', 'maxTouchPoints', 'touchSpoofEnabled']).then(sendResponse);
    return true;
  } else if (message.type === 'set-settings') {
    browser.storage.local.set(message.data).then(() => {
      if (message.data.selectedUA) {
        cachedUA = message.data.selectedUA;
        console.log('[UserAgent Extension] UA updated from popup:', cachedUA);
      }
      sendResponse({ success: true });
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