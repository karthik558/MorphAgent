const fs = require('fs');

const baseManifest = {
  name: "MorphAgent",
  version: "4.7.0",
  description: "Modern User Agent & Anti-Fingerprinting Suite",
  icons: {
    "16": "icons/icon.png",
    "48": "icons/icon.png",
    "128": "icons/icon.png"
  },
  homepage_url: "https://github.com/karthik558/MorphAgent",
  permissions: [
    "storage",
    "declarativeNetRequest",
    "tabs",
    "scripting",
    "contextMenus",
    "alarms",
    "proxy",
    "privacy"
  ],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "js/background.js",
    type: "module"
  },
  options_ui: {
    page: "advanced-settings.html",
    open_in_tab: true
  },
  action: {
    default_popup: "popup.html",
    default_title: "MorphAgent 4.6",
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
      resources: ["js/inject.js"],
      matches: ["<all_urls>"]
    }
  ]
};

const v3Manifest = {
  ...baseManifest,
  manifest_version: 3,
  minimum_chrome_version: "111"
};

const firefoxManifest = {
  ...baseManifest,
  manifest_version: 3,
  background: { scripts: ["js/background.js"], type: "module" },
  browser_specific_settings: {
    gecko: {
      id: "morph-agent@karthiklal.in",
      strict_min_version: "128.0",
      data_collection_permissions: { required: ["none"] }
    }
  }
};

const target = process.argv[2] || 'all';
if (!['all', 'chrome', 'firefox'].includes(target)) throw new Error('Expected chrome, firefox or all');

if (target === 'chrome' || target === 'all') {
  fs.writeFileSync('manifest.chrome.json', JSON.stringify(v3Manifest, null, 2));
  fs.writeFileSync('manifest.json', JSON.stringify(v3Manifest, null, 2));
  console.log('✓ Generated manifest.chrome.json and updated manifest.json (Manifest V3)');
}

if (target === 'firefox' || target === 'all') {
  fs.writeFileSync('manifest.firefox.json', JSON.stringify(firefoxManifest, null, 2));
  if (target === 'firefox') fs.writeFileSync('manifest.json', JSON.stringify(firefoxManifest, null, 2));
  console.log('✓ Generated manifest.firefox.json (Manifest V3)');
}
