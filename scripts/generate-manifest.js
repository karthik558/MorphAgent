#!/usr/bin/env node
/**
 * MorphAgent Manifest Generator
 * Generates Chrome Manifest V3 and Firefox Manifest V2/V3 manifests
 * 
 * Usage:
 *   node scripts/generate-manifest.js [chrome|firefox|all]
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const baseManifest = {
  name: "MorphAgent",
  version: "4.0.0",
  description: "Modern User Agent & Anti-Fingerprinting Extension for Chrome, Edge, Firefox, and Chromium browsers.",
  icons: {
    "16": "icons/icon.png",
    "48": "icons/icon.png",
    "128": "icons/icon.png"
  },
  homepage_url: "https://github.com/karthik558/MorphAgent"
};

// Chrome Manifest V3
const chromeManifest = {
  ...baseManifest,
  manifest_version: 3,
  permissions: [
    "storage",
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess",
    "tabs",
    "scripting",
    "contextMenus"
  ],
  host_permissions: [
    "<all_urls>"
  ],
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
      js: ["js/content.js"],
      run_at: "document_start",
      all_frames: true
    }
  ],
  web_accessible_resources: [
    {
      resources: [
        "advanced-settings.html",
        "css/advanced-settings.css",
        "js/advanced-settings.js",
        "js/profiles.js"
      ],
      matches: ["<all_urls>"]
    }
  ]
};

// Firefox Manifest V2
const firefoxManifest = {
  ...baseManifest,
  manifest_version: 2,
  permissions: [
    "storage",
    "webRequest",
    "webRequestBlocking",
    "tabs",
    "windows",
    "contextMenus",
    "<all_urls>"
  ],
  background: {
    scripts: ["js/background.js"],
    persistent: true
  },
  browser_action: {
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
      js: ["js/content.js"],
      run_at: "document_start",
      all_frames: true
    }
  ],
  web_accessible_resources: [
    "advanced-settings.html",
    "css/advanced-settings.css",
    "js/advanced-settings.js",
    "js/profiles.js"
  ],
  browser_specific_settings: {
    gecko: {
      id: "morph-agent@karthiklal.in",
      strict_min_version: "68.0"
    },
    gecko_android: {
      strict_min_version: "113.0"
    }
  }
};

function generate() {
  const target = (process.argv[2] || 'all').toLowerCase();

  const chromePath = path.join(rootDir, 'manifest.chrome.json');
  const firefoxPath = path.join(rootDir, 'manifest.firefox.json');
  const mainPath = path.join(rootDir, 'manifest.json');

  if (target === 'chrome' || target === 'all') {
    fs.writeFileSync(chromePath, JSON.stringify(chromeManifest, null, 2) + '\n');
    console.log('✓ Generated manifest.chrome.json (Manifest V3)');
  }

  if (target === 'firefox' || target === 'all') {
    fs.writeFileSync(firefoxPath, JSON.stringify(firefoxManifest, null, 2) + '\n');
    console.log('✓ Generated manifest.firefox.json (Manifest V2)');
  }

  // Default manifest.json set to Chrome MV3 (with fallback for Firefox)
  if (target === 'chrome') {
    fs.writeFileSync(mainPath, JSON.stringify(chromeManifest, null, 2) + '\n');
    console.log('✓ Set default manifest.json -> Chrome MV3');
  } else if (target === 'firefox') {
    fs.writeFileSync(mainPath, JSON.stringify(firefoxManifest, null, 2) + '\n');
    console.log('✓ Set default manifest.json -> Firefox MV2');
  } else {
    // For 'all', write Chrome MV3 to default manifest.json
    fs.writeFileSync(mainPath, JSON.stringify(chromeManifest, null, 2) + '\n');
    console.log('✓ Set default manifest.json -> Chrome MV3');
  }
}

generate();
