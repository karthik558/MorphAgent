# MorphAgent

> **Modern User Agent & Anti-Fingerprinting Suite for Chrome, Edge & Firefox**  
> 100% Chromium (Manifest V3) & Firefox Dual Engine with 10 Ultimate Stealth Protections

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-Manifest_V3-green.svg?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-Manifest_V2/V3-orange.svg?style=flat-square)
![Profiles](https://img.shields.io/badge/profiles-130+-black.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-black.svg?style=flat-square)

---

## Overview

MorphAgent is a professional-grade browser spoofing and anti-fingerprinting extension engineered for Chromium (Chrome, Edge, Brave, Opera, Vivaldi) and Firefox. It provides zero-latency request header interception via Manifest V3 DeclarativeNetRequest dynamic rules, alongside 10 advanced JavaScript stealth matrix protections.

---

## What's New in Version 4.0

1. **Dual Engine Manifest V3 & Manifest Generator (`scripts/generate-manifest.js`)**  
   Automatically builds Manifest V3 for Chromium browsers and Manifest V2/V3 for Firefox with dynamic header spoofing.

2. **Client Hints (`Sec-CH-UA`) & `navigator.userAgentData` Synchronous Engine**  
   Full spoofing of `Sec-CH-UA`, `Sec-CH-UA-Mobile`, and `Sec-CH-UA-Platform` headers paired with synchronous `navigator.userAgentData.getHighEntropyValues()` injection.

3. **Deterministic Canvas & WebGL Stealth Matrix**  
   Domain-seeded noise algorithm for `toDataURL()`, `toBlob()`, and `getImageData()`. Spoofs `UNMASKED_VENDOR_WEBGL` and `UNMASKED_RENDERER_WEBGL` across WebGL 1.0 & 2.0 without triggering CreepJS or FingerprintJS heuristic detection.

4. **AudioContext Fingerprint Shield & WebRTC IP Leak Defense**  
   Imperceptible frequency noise injection into `AnalyserNode.getFloatFrequencyData` and local ICE candidate IP sanitization for WebRTC.

5. **GPS Geolocation, Timezone & Locale Sync Engine**  
   GPS coordinate mocking, system timezone alignment via `Intl.DateTimeFormat().resolvedOptions().timeZone`, and system locale synchronization.

6. **Screen Resolution, Orientation & Font Metrics Matrix**  
   Device-accurate `screen.width`, `screen.height`, `screen.colorDepth`, `window.devicePixelRatio`, orientation, and canvas `TextMetrics` micro-variation.

7. **Custom Profile Builder Studio**  
   GUI in Advanced Settings to create, edit, save, and delete custom device profiles with custom Client Hints, touch points, screen size, and OS parameters.

8. **Real-Time Live Fingerprint Leak Inspector**  
   Embedded live testing inspector that evaluates active User-Agent, Client Hints, Canvas noise, Audio noise, WebGL GPU string, and WebRTC status in real time.

9. **Context Menu Fast Switcher & Toolbar Action Badges**  
   Right-click context menu options for instant profile switching (`iPhone 17`, `Chrome 145`) and live action badge indicators (`MOB`, `TAB`, `DES`, `GAM`).

10. **Futuristic GitHub-Inspired Animated UI**  
    Glassmorphic interface featuring a quick search profile filter, keyboard shortcuts, and dark/light mode themes.

---

## Manifest Generator Script

MorphAgent includes a Node.js build script to generate manifest files for specific browser targets:

```bash
# Generate both Chrome Manifest V3 and Firefox Manifest V2/V3
npm run build:manifest

# Generate individually:
npm run build:chrome
npm run build:firefox
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
   node scripts/generate-manifest.js chrome
   ```
3. Open the extension management page in your browser:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the `MorphAgent` project directory.

---

### Mozilla Firefox

1. Generate the Firefox Manifest configuration:
   ```bash
   node scripts/generate-manifest.js firefox
   ```
2. Navigate to `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on...**
4. Select `manifest.json` (or `manifest.firefox.json`) from the project directory.

---

## Privacy & Stealth

- **Local Storage Only** — Zero telemetry, zero analytics, zero external dependencies.
- **100% Native Cloaking** — All spoofed JavaScript methods pass `Function.prototype.toString()` native code checks.
- **Block List & Per-Site Rules** — Exclude sensitive domains (e.g., banking portals) with wildcard matching.

---

## License

Licensed under the [MIT License](LICENSE). Developed by [Karthik Lal](https://github.com/karthik558).