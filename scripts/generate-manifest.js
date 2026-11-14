const fs = require('fs');

const baseManifest = {
  name: "MorphAgent",
  version: "4.8.2",
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
  commands: {
    "apply-current-tab": {
      suggested_key: { default: "Alt+Shift+M", mac: "Alt+Shift+M" },
      description: "Apply the MorphAgent profile to the current site"
    },
    "pause-shield-site": {
      suggested_key: { default: "Alt+Shift+P", mac: "Alt+Shift+P" },
      description: "Pause or resume the shield on this site"
    },
    "open-profile-lab": {
      suggested_key: { default: "Alt+Shift+L", mac: "Alt+Shift+L" },
      description: "Open the MorphAgent profile lab"
    }
  },
  host_permissions: ["<all_urls>"],
  declarative_net_request: {
    rule_resources: [
      { id: "morph-ads", enabled: true, path: "rules/ads.json" },
      { id: "morph-trackers", enabled: true, path: "rules/trackers.json" },
      { id: "morph-miners", enabled: true, path: "rules/miners.json" }
    ]
  },
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
    default_title: "MorphAgent 4.8.2",
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
      js: ["js/adblock-rules.js", "js/content.js"],
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
  permissions: [...baseManifest.permissions, "declarativeNetRequestFeedback"],
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
