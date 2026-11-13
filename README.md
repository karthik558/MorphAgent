<img src="icons/icon.png" alt="Icon" width="96" height="96" />

# MorphAgent

> **Modern User Agent & Anti-Fingerprinting Suite for Chrome, Edge & Firefox**
> Manifest V3 for Chromium and Firefox with configurable privacy protections

![Version](https://img.shields.io/badge/version-4.8.2-blue.svg?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-Manifest_V3-green.svg?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-Manifest_V3-orange.svg?style=flat-square)
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

## What's New in Version 4.8.2

1. **Built-in Ad & Tracker Filtering**
   - **Zero-Latency C++ Network Interception**: 220+ top programmatic ad exchanges, tracking pixels (Meta, TikTok, Twitter, LinkedIn), telemetry engines (Hotjar, Clarity, Mixpanel), and in-browser cryptominers blocked via native MV3 DeclarativeNetRequest dynamic rules.
   - **Cross-Browser Dual Engine**: Chrome MV3 `declarativeNetRequest` + Firefox MV3 `declarativeNetRequest` filtering.
   - Independent bundled controls for ads, trackers, cryptominers, social widgets, and cookie/newsletter notices. Optional cosmetic groups are off by default.

2. **Live Filter Controls**
   - Category and individual switches persist across reloads and update network and cosmetic filtering.
   - The popup can pause or resume the shield for the current site and shows the installed network rule count.
   - Filter lists ship with extension releases. Remote subscriptions and custom rule compilation are not supported.

3. **Google & YouTube Ad Controls**
   - Google sponsored-result elements and YouTube ad containers are hidden with cosmetic filters.
   - Best-effort YouTube skipping only touches a player explicitly marked as showing an ad, preserving volume and playback speed.
   - Server-inserted ads and changes to site markup can bypass these rules; this is not guaranteed universal ad blocking. Reload existing tabs after upgrading from the old injected script.

4. **DNS Provider Reference**
   - Synchronized saved references for DNS-over-HTTPS (DoH) providers (AdGuard DNS, Cloudflare 1.1.1.1, Quad9, NextDNS, CleanBrowsing, Direct OS, Custom) across Popup and Advanced Settings.

5. **Proxyium Anonymous Web Tunnel & Native Browser Proxy Switcher**
   - **One-Click Proxyium Web Proxy**: Route any tab or custom URL anonymously through isolated European (Poland/France Fast), United States (Geo-Unblock), and Singapore (Asia-Pacific) cloud exit nodes without leaving your browser.
   - **Native Browser Proxy Controller (`chrome.proxy`)**: Direct connection, manual proxy switcher with SOCKS5 (Tor 127.0.0.1:9050 preset), SOCKS4, HTTP, and PAC script integration paired with strict WebRTC IP leak shielding.
   - **Geo-Location Exit Node Synchronization**: Dynamically synchronizes GPS coordinates with the active proxy region.
   - **Context Menu Shortcuts**: Right-click any webpage or link to instantly open it inside a clean Proxyium anonymous web proxy tunnel.

---

## Features Overview

1. **Dual Engine Manifest V3 & Manifest Generator (`scripts/generate-manifest.js`)**
   Automatically builds Manifest V3 for Chromium browsers and Manifest V3 for Firefox with dynamic header spoofing.

2. **Client Hints (`Sec-CH-UA`) & `navigator.userAgentData` Synchronous Engine**
   Full spoofing of `Sec-CH-UA`, `Sec-CH-UA-Mobile`, and `Sec-CH-UA-Platform` headers paired with synchronous `navigator.userAgentData.getHighEntropyValues()` injection.

3. **Proxyium Web Proxy & Native SOCKS5/HTTP Proxy Switcher**
   Instant web tunneling through Proxyium multi-region exit nodes (Poland, US, Singapore) and full native browser proxy configuration with preset profiles (Tor, Local SOCKS5, HTTP).

4. **Cryptographic Canvas & WebGL Stealth Matrix**
   Domain-seeded noise algorithm for `toDataURL()`, `toBlob()`, and `getImageData()`. Spoofs `UNMASKED_VENDOR_WEBGL` and `UNMASKED_RENDERER_WEBGL` across WebGL 1.0 & 2.0 with cryptographic sub-pixel variation.

5. **Ghost Mode (Intelligent Auto-Rotation)**
   When enabled, a background timer automatically rotates your user agent and touch settings at configurable intervals to break persistent cross-site tracking sessions.

6. **ClientRects & DOM Bounding Box Spoofing**
   Intercepts `getBoundingClientRect` to inject microscopic noise, destroying OS-level font rendering and layout tracking vectors.

7. **WebRTC IP Leak Shield & Network Spoofing**
   Silently strips local IPv4/IPv6 addresses from WebRTC offers (with a dedicated toggle) and spoofs `navigator.connection` to perfectly match your selected device profile (e.g. returning a 4G cellular connection when spoofing an iPhone).

8. **Battery API & Sensor Spoofing**
   Spoofs `navigator.getBattery()` to return a fake, slowly discharging 85% battery level across all tabs.

9. **Font Enumeration Defender & Behavioral Masking**
   Defeats font hashing by adding variance to `offsetWidth`/`offsetHeight`, and introduces slight jitter into mouse coordinates and typing timestamps to mask behavioral biometrics.

10. **AudioContext Fingerprint Shield**
    Imperceptible frequency noise injection into `AnalyserNode.getFloatFrequencyData` and offline audio buffers.

11. **GPS Geolocation & Timezone Spoofing Engine**
    GPS coordinate mocking (`getCurrentPosition` & `watchPosition`), city presets, custom latitude/longitude inputs, and synchronous `Intl.DateTimeFormat` timezone spoofing.

12. **Screen Resolution, Orientation & Media Devices Masking**
    Device-accurate `screen.width/height`, pixel depth, orientation, and deterministic webcam/microphone enumeration masking.

13. **Custom Profile Builder Studio & Context Menu Switcher**
    GUI to create custom device profiles. Right-click context menus for instant profile switching (`iPhone 17`, `Chrome 145`), quick location presets, and Proxyium web proxy tunneling.

14. **Real-Time Live Fingerprint Leak Inspector**
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
# Generate both Chrome Manifest V3 and Firefox Manifest V3
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
4. Select `morph-agent-firefox.zip`. To load the source directory instead, run `npm run manifest:firefox` first, then select `manifest.json`. Restore Chrome with `npm run manifest:chrome`.

---

## Privacy & Stealth

- **Local Storage Only** — Zero telemetry, zero analytics, zero external dependencies.
- **Page-level masking** — Selected APIs are wrapped; this cannot guarantee native behavior or undetectability across browser engines.
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

## Compatibility and validation

Both packages use Manifest V3. Chrome uses a module service worker (Chrome 111+); Firefox uses a module event page (Firefox 128+). Both use declarative network rules. Grant website access when prompted so network and page protections can run.

- `npm test`: manifest, network-rule, CSP and API-adapter regression checks.
- `npm run build:chrome` / `npm run build:firefox`: fresh, isolated release archives. Packaging leaves the source manifest set to Chrome.
- `npm run manifest:firefox` / `npm run manifest:chrome`: explicitly switch the source manifest for unpacked loading.

DNS preferences do not change the browser resolver; configure Secure DNS in browser settings. Filtering lists are bundled, not equivalent to full AdGuard/uBlock subscriptions. Page-level JavaScript protection cannot guarantee interception before every page script, or undetectable fingerprints. Test important sites after changing spoofing or proxy settings.

### Privacy Tools

Open **Advanced Settings → Privacy Tools** for:

1. **URL rule tester**: previews effective network user agent, JavaScript blocking, matching website rules, conflicts, and filter settings using the network rule builders.
2. **Protection health**: checks website permissions, installed network rules, proxy ownership, WebRTC policy, and the Ghost Mode alarm.
3. **Temporary exceptions**: pause all site protections or only scripts, filters, or fingerprint/location spoofing for 10 minutes, one hour, or until browser restart. Browser-wide proxy and WebRTC policies remain active. Network rules restore on expiry; reload existing pages to restore page-level protections.
4. **Named presets**: save up to 30 local configurations, preview differences, apply, export, delete, or undo the last application.
5. **Validated imports**: JSON imports now show a preview before applying, reject invalid settings, and automatically save a rollback backup. Logs and counters are not imported. Reload the settings page after applying or restoring configuration before further editing.
6. **Live consistency checks**: inspect a selected website tab for user agent, client hints, platform, touch, screen, timezone, language, and hardware inconsistencies. No real GPS request is made by this inspector.
7. **Guided troubleshooting**: temporarily test script blocking, filtering, and fingerprint protection separately. Each trial expires in 10 minutes; selecting “Fixed” retains only that group’s exception for one hour. Remove existing exceptions first.

Presets, backups, and exceptions stay in local extension storage. Site rule settings retain their existing browser-sync behavior. No new service or dependency is required.

### Protection correctness and limits

- Non-Chromium identities no longer advertise fabricated Chromium JavaScript client hints. High-entropy request headers are removed while spoofing to avoid exposing native hardware details.
- Explicit zero touch points are honored. Site rules respect the global user-agent switch. Overlapping network user-agent rules honor first-match priority.
- GPS calls fail with a position-unavailable error if settings cannot load, instead of falling back to real GPS. Canceling a location watch also cancels queued mock callbacks.
- Timezone formatting and offsets use the selected IANA timezone, including daylight-saving transitions and explicit caller timezone overrides. Automatic coordinate-to-timezone lookup is approximate; choose an explicit timezone when accuracy matters. Native Date string methods and workers may still expose differences.
- WebRTC leak policy stays enabled while a native proxy is active. Turning it off clears the extension’s policy rather than overriding another controller. Browser and proxy support still determine actual network routing.
- Ghost Mode rotates user agent and touch settings; it does not change public IP, clear site storage, or guarantee an undetectable identity. Reload existing tabs after a rotation to align page values with new request headers.
- Generic `si` and `ref_` query parameters are preserved to avoid breaking unrelated site functionality. Detection logs describe page API activity, not proof that a tracker was neutralized.

Chromium acceptance tests cover the new UI workflows, timed exception expiry, preset rollback, client hints, zero touch points, daylight-saving offsets, location watch cancellation, startup GPS failure, battery API, and proxy/WebRTC policy. Firefox runtime, remote proxy services, every website, and worker/iframe fingerprint surfaces are not certified by these tests.

### Ad-blocking regression checks

Run `npm test` for rule and compatibility tests. With Puppeteer available, run `CHROME_PATH=/path/to/chrome node tests/adblock-browser.cjs` for isolated Chromium UI and local-page acceptance checks. The browser check does not certify live YouTube coverage or Firefox runtime behavior.

### Popup and feature verification

The popup includes a compact site shield card. Existing spoofing controls now clear on page reload when disabled. JavaScript blocking uses response CSP before page parsing; changing spoofing or script blocking requires a page reload. Page JavaScript settings are loaded asynchronously from extension storage and cannot guarantee interception before every early fingerprinting script.

`CHROME_PATH=/path/to/chrome node tests/features-browser.cjs` checks initial request headers and JavaScript user agents, touch on/off, global and site-specific script blocking, exclusions, hardware and timezone switches, zero coordinates, WebRTC policy, Ghost Mode alarms, local HTTP proxy routing/rejection/disconnect, navigation, light/dark popup layout, and settings export/import. The tests use an isolated Chromium profile and local fixtures. External Proxyium connectivity, live site ad coverage, Firefox runtime behavior, and every low-level fingerprinting defense are not certified by this suite.
