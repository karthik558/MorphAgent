<img src="icons/icon.png" alt="Icon" width="96" height="96" />

# MorphAgent

> **Modern User Agent & Anti-Fingerprinting Suite for Chrome, Edge & Firefox**  
> 100% Chromium (Manifest V3) & Firefox Dual Engine with 10 Ultimate Stealth Protections

![Version](https://img.shields.io/badge/version-4.1.0-blue.svg?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-Manifest_V3-green.svg?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-Manifest_V2/V3-orange.svg?style=flat-square)
![Profiles](https://img.shields.io/badge/profiles-130+-black.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-black.svg?style=flat-square)
[![Release Chrome Extension](https://github.com/karthik558/MorphAgent/actions/workflows/release-chrome.yml/badge.svg)](https://github.com/karthik558/MorphAgent/actions/workflows/release-chrome.yml)

---

## **Official Firefox Extension**

MorphAgent is available on the official Mozilla Firefox Add-ons store.

<a href="https://addons.mozilla.org/en-US/firefox/addon/morphagent/" target="_blank">
  <img src="https://img.shields.io/badge/Install_from_Firefox_Add--ons-FF7139?style=for-the-badge&logo=firefox&logoColor=white&labelColor=2D3748" alt="Install from Firefox Add-ons" />
</a>

## **Screenshots**

<table>
   <tr>
      <th colspan="2" style="font-size:1.1em;">Main Interface (Popup)</th>
   </tr>
   <tr>
      <td>
         <img src="https://files.catbox.moe/c0b6o4.png" alt="Popup Light Mode" width="300" />
         <div style="text-align: center;">Light Mode</div>
      </td>
      <td>
         <img src="https://files.catbox.moe/d2q90g.png" alt="Popup Dark Mode" width="300" />
         <div style="text-align: center;">Dark Mode</div>
      </td>
   </tr>
   <tr>
      <th colspan="2" style="font-size:1.1em;">Threat Analytics Dashboard</th>
   </tr>
   <tr>
      <td>
         <img src="https://files.catbox.moe/pphnn8.png" alt="Analytics Light Mode" width="400" />
         <div style="text-align: center;">Light Mode</div>
      </td>
      <td>
         <img src="https://files.catbox.moe/ea7901.png" alt="Analytics Dark Mode" width="400" />
         <div style="text-align: center;">Dark Mode</div>
      </td>
   </tr>
   <tr>
      <th colspan="2" style="font-size:1.1em;">Feature Descriptions</th>
   </tr>
   <tr>
      <td>
         <img src="https://files.catbox.moe/qeeewr.png" alt="Features Light Mode" width="400" />
         <div style="text-align: center;">Light Mode</div>
      </td>
      <td>
         <img src="https://files.catbox.moe/h3jyf6.png" alt="Features Dark Mode" width="400" />
         <div style="text-align: center;">Dark Mode</div>
      </td>
   </tr>
</table>

---

## Overview

MorphAgent is a professional-grade browser spoofing and anti-fingerprinting extension engineered for Chromium (Chrome, Edge, Brave, Opera, Vivaldi) and Firefox. It provides zero-latency request header interception via Manifest V3 DeclarativeNetRequest dynamic rules, alongside 10 advanced JavaScript stealth matrix protections.

---

## What's New in Version 4.1

1. **Access Control (Blacklist & Whitelist Modes)**  
   Full support for Blacklist Mode (disable spoofing on specified sites) and Whitelist Mode (enable spoofing ONLY on specified sites) across both HTTP headers and JS stealth injections.

2. **Access Control UI & Segmented Controls**  
   Modernized tab controls matching MorphAgent's dark neon red theme, dynamic context descriptions, responsive layout fixes, and updated sidebar navigation.

3. **In-App Protections & Usage Guide**  
   Embedded reference guide in Advanced Settings covering all 10+ stealth protections with recommended configurations for privacy, compatibility, and evasion.

---

## Features Overview

1. **Dual Engine Manifest V3 & Manifest Generator (`scripts/generate-manifest.js`)**  
   Automatically builds Manifest V3 for Chromium browsers and Manifest V2/V3 for Firefox with dynamic header spoofing.

2. **Client Hints (`Sec-CH-UA`) & `navigator.userAgentData` Synchronous Engine**  
   Full spoofing of `Sec-CH-UA`, `Sec-CH-UA-Mobile`, and `Sec-CH-UA-Platform` headers paired with synchronous `navigator.userAgentData.getHighEntropyValues()` injection.

3. **Cryptographic Canvas & WebGL Stealth Matrix**  
   Domain-seeded noise algorithm for `toDataURL()`, `toBlob()`, and `getImageData()`. Spoofs `UNMASKED_VENDOR_WEBGL` and `UNMASKED_RENDERER_WEBGL` across WebGL 1.0 & 2.0 with cryptographic sub-pixel variation.

4. **Ghost Mode (Intelligent Auto-Rotation)**  
   When enabled, a background timer automatically rotates your entire browser identity (User Agent, Touch Points, Canvas Seed) at configurable intervals to break persistent cross-site tracking sessions.

5. **ClientRects & DOM Bounding Box Spoofing**  
   Intercepts `getBoundingClientRect` to inject microscopic noise, destroying OS-level font rendering and layout tracking vectors.

6. **WebRTC IP Leak Shield & Network Spoofing**  
   Silently strips local IPv4/IPv6 addresses from WebRTC offers (with a dedicated toggle) and spoofs `navigator.connection` to perfectly match your selected device profile (e.g. returning a 4G cellular connection when spoofing an iPhone).

7. **Battery API & Sensor Spoofing**  
   Spoofs `navigator.getBattery()` to return a fake, slowly discharging 85% battery level across all tabs.

8. **Font Enumeration Defender & Behavioral Masking**  
   Defeats font hashing by adding variance to `offsetWidth`/`offsetHeight`, and introduces slight jitter into mouse coordinates and typing timestamps to mask behavioral biometrics.

9. **AudioContext Fingerprint Shield**  
   Imperceptible frequency noise injection into `AnalyserNode.getFloatFrequencyData` and offline audio buffers.

10. **GPS Geolocation & Timezone Spoofing Engine**  
    GPS coordinate mocking (`getCurrentPosition` & `watchPosition`), city presets, custom latitude/longitude inputs, and synchronous `Intl.DateTimeFormat` timezone spoofing.

11. **Screen Resolution, Orientation & Media Devices Masking**  
    Device-accurate `screen.width/height`, pixel depth, orientation, and deterministic webcam/microphone enumeration masking.

12. **Custom Profile Builder Studio & Context Menu Switcher**  
    GUI to create custom device profiles. Right-click context menus for instant profile switching (`iPhone 17`, `Chrome 145`) and quick location presets.

13. **Real-Time Live Fingerprint Leak Inspector**  
    Embedded live testing inspector (`spoof_test.html`) that evaluates Canvas noise, WebGL GPU string, WebRTC, ClientRects, Network, and Battery status in real time.

---

## **Quick Start**

1. Click the MorphAgent icon in your browser toolbar
2. Select device category: Mobile, Tablet, Desktop, or Gaming  
3. Choose specific profile from the device grid
4. Toggle touch spoofing (automatically sets appropriate touch points)
5. Apply changes - refresh pages to see the new user agent

### Advanced Configuration
Click **"Advanced Settings"** for power-user features:
- **Website Rules**: Set automatic profiles for specific domains with wildcard support
- **Block List**: Disable spoofing on sensitive sites
- **Tab-Specific Settings**: View, copy, and manage per-tab UA overrides
- **Import/Export**: Backup and share your configuration as JSON
- **Custom User Agents**: Enter any UA string manually
- **Open Extension Debugging**: Quick shortcut to debugging pages
- **Reset All Settings**: Factory reset with confirmation

---

## Manifest Generator Script

MorphAgent includes a Node.js build script to generate manifest files for specific browser targets:

```bash
# Generate both Chrome Manifest V3 and Firefox Manifest V2/V3
npm run build:manifest

# Build and package for Firefox (creates morph-agent-firefox.zip)
npm run build:firefox

# Generate individually:
npm run build:chrome
```

---

## Installation

### Chromium Browsers (Chrome, Edge, Brave, Opera, Vivaldi)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/karthik558/MorphAgent.git
   cd MorphAgent
   ```
2. Generate the Chrome Manifest V3 configuration:
   ```bash
   npm run build:chrome
   ```
3. Open the extension management page in your browser:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the `MorphAgent` project directory.

---

### Mozilla Firefox

**Option 1: Official Store**
Install it directly from the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/morphagent/).

**Option 2: Manual Installation**
1. Generate the Firefox Manifest configuration and package it:
   ```bash
   npm run build:firefox
   ```
2. Navigate to `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on...**
4. Select `manifest.json` (or `morph-agent-firefox.zip`) from the project directory.

---

## Privacy & Stealth

- **Local Storage Only** — Zero telemetry, zero analytics, zero external dependencies.
- **100% Native Cloaking** — All spoofed JavaScript methods pass `Function.prototype.toString()` native code checks.
- **Block List & Per-Site Rules** — Exclude sensitive domains (e.g., banking portals) with wildcard matching.

---

## **Known Limitations**

- **Content Security Policy**: Some sites with strict CSP may limit content script injection
- **Touch API Scope**: Only affects `navigator.maxTouchPoints`
- **Banking Sites**: Recommended to use block list for financial websites

---

## License

Licensed under the [MIT License](LICENSE). 

## Author

**Developed by KARTHIK LAL**
- GitHub: [@karthik558](https://github.com/karthik558)
- Design: Modern interface with dark/light themes
- Features: Advanced per-site spoofing with Detection Shield
- Database: Comprehensive device profile collection (130+ profiles)
- UX: Enhanced user experience and professional polish

**Built with ❤️ for developers who value browser privacy and testing**

*MorphAgent - Transform your browser identity with professional-grade spoofing & anti-fingerprinting*

**⭐ Star this repo if MorphAgent helps your development workflow!**