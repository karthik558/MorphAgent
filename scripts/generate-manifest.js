const fs = require('fs');

const baseManifest = {
  name: "MorphAgent",
  version: "4.0.0",
  description: "Modern User Agent & Anti-Fingerprinting Extension for Chrome, Edge, Firefox, and Chromium browsers.",
  icons: {
    "16": "icons/icon.png",
    "48": "icons/icon.png",
    "128": "icons/icon.png"
  },
  homepage_url: "https://github.com/karthik558/MorphAgent",
  permissions: [
    "storage",
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess",
    "tabs",
    "scripting",
    "contextMenus"
  ],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "js/background.js",
    type: "module"
  },
  action: {
    default_popup: "popup.html",
    default_title: "MorphAgent 4.0",
    default_icon: {
      "16": "icons/icon.png",
      "48": "icons/icon.png",
      "128": "icons/icon.png"
    }
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["js/inject.js"],
      run_at: "document_start",
      all_frames: true,
      match_about_blank: true,
      world: "MAIN"
    },
    {
      matches: ["<all_urls>"],
      js: ["js/content.js"],
      run_at: "document_start",
      all_frames: true,
      match_about_blank: true
    }
  ],
  web_accessible_resources: [
    {
      resources: [
        "advanced-settings.html",
        "css/advanced-settings.css",
        "js/advanced-settings.js",
        "js/profiles.js",
        "js/inject.js"
      ],
      matches: ["<all_urls>"]
    }
  ]
};

const v3Manifest = {
  ...baseManifest,
  manifest_version: 3
};

const v2Manifest = {
  ...baseManifest,
  manifest_version: 2,
  permissions: [
    "storage",
    "webRequest",
    "webRequestBlocking",
    "tabs",
    "contextMenus",
    "<all_urls>"
  ],
  background: {
    scripts: ["js/background.js"]
  },
  browser_action: baseManifest.action,
  web_accessible_resources: [
    "advanced-settings.html",
    "css/advanced-settings.css",
    "js/advanced-settings.js",
    "js/profiles.js",
    "js/inject.js"
  ],
  browser_specific_settings: {
    gecko: {
      id: "morph-agent@karthiklal.in",
      data_collection_permissions: {
        required: ["none"]
      }
    }
  }
};
delete v2Manifest.action;
delete v2Manifest.host_permissions;

const target = process.argv[2] || 'all';

if (target === 'chrome' || target === 'all') {
  fs.writeFileSync('manifest.chrome.json', JSON.stringify(v3Manifest, null, 2));
  console.log('✓ Generated manifest.chrome.json (Manifest V3)');
}

if (target === 'firefox' || target === 'all') {
  fs.writeFileSync('manifest.firefox.json', JSON.stringify(v2Manifest, null, 2));
  console.log('✓ Generated manifest.firefox.json (Manifest V2)');
}

if (target === 'all') {
  fs.writeFileSync('manifest.json', JSON.stringify(v3Manifest, null, 2));
  console.log('✓ Set default manifest.json -> Chrome MV3');
}
