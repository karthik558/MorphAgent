// Enhanced Device/Browser Profiles for UA Spoofing (2026 Edition)
// Organized by categories with platform subcategories

// Browser types with their typical patterns
const browserTypes = {
  all: {
    name: 'All Browsers',
    icon: 'all',
    pattern: '',
    patterns: [],
    platforms: ['all']
  },
  chrome: {
    name: 'Google Chrome',
    icon: 'chrome',
    pattern: 'Chrome',
    patterns: ['Chrome', 'CriOS'],
    platforms: ['all']
  },
  firefox: {
    name: 'Mozilla Firefox', 
    icon: 'firefox',
    pattern: 'Firefox',
    patterns: ['Firefox', 'FxiOS'],
    platforms: ['all']
  },
  safari: {
    name: 'Safari',
    icon: 'safari', 
    pattern: 'Safari',
    patterns: ['Safari'],
    platforms: ['ios', 'ipad', 'macos']
  },
  edge: {
    name: 'Microsoft Edge',
    icon: 'edge',
    pattern: 'Edg',
    patterns: ['Edg', 'EdgiOS', 'EdgA'],
    platforms: ['all']
  }
};

const profiles = {
  mobile: {
    name: 'Mobile Devices',
    icon: 'mobile',
    platforms: {
      ios: {
        name: 'iOS Devices',
        variants: [
          // iPhone 18 Series (Latest 2026 Release)
          {
            name: 'iPhone 18 Pro Max (iOS 27.0)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 Pro (iOS 27.0)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 Air (iOS 27.0)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 Plus (iOS 27.0)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 (iOS 27.0)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 18 Chrome Profiles
          {
            name: 'iPhone 18 Pro Max (Chrome 146)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/146.0.7680.120 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 Pro (Chrome 146)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/146.0.7680.120 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 18 Firefox Profiles
          {
            name: 'iPhone 18 Pro Max (Firefox 144)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/144.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 Pro (Firefox 144)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/144.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 18 Edge Profiles
          {
            name: 'iPhone 18 Pro Max (Edge 146)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/146.0.3250.70 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 18 Pro (Edge 146)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/146.0.3250.70 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 17 Series
          {
            name: 'iPhone 17 Pro Max (iOS 26.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Pro (iOS 26.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Air (iOS 26.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Pro Max (Chrome 145)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/145.0.7632.112 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Pro (Chrome 145)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/145.0.7632.112 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Pro Max (Firefox 142)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/142.0 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 16 Series
          {
            name: 'iPhone 16 Pro Max (iOS 26.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 16 Pro (iOS 26.1)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 16 (iOS 18.5)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 15 & SE Series
          {
            name: 'iPhone 15 Pro Max (iOS 18.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone SE 4th Gen (iOS 26.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          }
        ]
      },
      android: {
        name: 'Android Devices',
        variants: [
          // Microsoft Surface Duo Series (Dual-Screen Foldables)
          {
            name: 'Surface Duo 3 (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Surface Duo 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36 EdgA/146.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Surface Duo 2 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Surface Duo 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36 EdgA/146.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Surface Duo (Android 14)',
            ua: 'Mozilla/5.0 (Linux; Android 14; Surface Duo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36 EdgA/145.0.0.0',
            touchPoints: 10
          },
          // Latest Foldable Devices (2026)
          {
            name: 'Google Pixel 10 Pro Fold (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro Fold) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Z Fold 7 (One UI 8.1)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-F968B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Z Flip 7 (One UI 8.1)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-F758B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus Open 2 (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; CPH2699) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest 2026 Samsung Flagships
          {
            name: 'Samsung Galaxy S26 Ultra (One UI 8.1)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-S948B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S26 Plus (One UI 8.1)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-S946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S26 (One UI 8.1)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-S941B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S25 Ultra (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S24 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest Google Pixel Series (2026)
          {
            name: 'Google Pixel 10 Pro XL (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 10 Pro (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 10 (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          {
            name: 'Google Pixel 9 Pro XL (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 9 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Latest OnePlus Devices (2026)
          {
            name: 'OnePlus 14 Pro (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; CPH2781) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus 14 (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; CPH2751) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus 13 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; CPH2649) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest Xiaomi Devices (2026)
          {
            name: 'Xiaomi 16 Ultra (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; 2602CPX5DG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 16 Pro (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; 2601CPX3DG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 15 Ultra (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; 2405CPH4DH) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Nothing Phone
          {
            name: 'Nothing Phone (3) (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; A069) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Nothing Phone (2a) (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; A142) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          }
        ]
      }
    }
  },
  tablet: {
    name: 'Tablet Devices',
    icon: 'tablet',
    platforms: {
      ios: {
        name: 'iPadOS Devices',
        variants: [
          // Latest 2026 iPad Models
          {
            name: 'iPad Pro 13" M5 (iPadOS 27.0)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 11" M5 (iPadOS 27.0)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 27_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 13" M4 (iPadOS 26.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 11" M4 (iPadOS 26.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Mini 8th Gen (iPadOS 26.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 13" M4 (iPadOS 18.5)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad 10th Gen (iPadOS 18.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          }
        ]
      },
      android: {
        name: 'Android Tablets',
        variants: [
          // Latest Samsung Galaxy Tab Models (2026)
          {
            name: 'Samsung Galaxy Tab S11 Ultra (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-X936B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S11 Plus (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-X836B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S10 Ultra (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-X926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel Tablet 2 (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel Tablet 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Lenovo Tab P12 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 15; TB-Q706F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 10
          }
        ]
      },
      windows: {
        name: 'Windows Tablets',
        variants: [
          // Latest Surface Pro Models (2026)
          {
            name: 'Microsoft Surface Pro 12 (Windows 11 26H2, ARM64)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Microsoft Surface Pro 11 Copilot+ (Windows 11, ARM64)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Microsoft Surface Pro 10',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
            touchPoints: 10
          }
        ]
      }
    }
  },
  desktop: {
    name: 'Desktop & Laptop',
    icon: 'desktop',
    platforms: {
      windows: {
        name: 'Windows',
        variants: [
          // Latest Chrome versions for Windows (2026)
          {
            name: 'Chrome 146 (Windows 11 26H2)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 145 (Windows 11 24H2)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 143 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 141 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Edge versions for Windows (2026)
          {
            name: 'Edge 146 (Windows 11 26H2)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 145 (Windows 11 24H2)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 143 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
            touchPoints: 0
          },
          // Latest Firefox versions for Windows (2026)
          {
            name: 'Firefox 144 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 142 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 140 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
            touchPoints: 0
          },
          // Latest Opera versions for Windows (2026)
          {
            name: 'Opera 118 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/118.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Opera 117 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/117.0.0.0',
            touchPoints: 0
          }
        ]
      },
      macos: {
        name: 'macOS',
        variants: [
          // Latest Safari versions for macOS (2026)
          {
            name: 'Safari 27.0 (macOS Redwood M5)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 27_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 26.4 (macOS Tahoe M4)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 26.2 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 18.5 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
            touchPoints: 0
          },
          // Latest Chrome versions for macOS (2026)
          {
            name: 'Chrome 146 (macOS Redwood M5)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 27_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 145 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 143 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Firefox versions for macOS (2026)
          {
            name: 'Firefox 144 (macOS Redwood)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 27.0; rv:144.0) Gecko/20100101 Firefox/144.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 142 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26.3; rv:142.0) Gecko/20100101 Firefox/142.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 140 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15.7; rv:140.0) Gecko/20100101 Firefox/140.0',
            touchPoints: 0
          }
        ]
      },
      linux: {
        name: 'Linux',
        variants: [
          // Latest Chrome on Linux (2026)
          {
            name: 'Chrome 146 (Ubuntu 26.04 LTS)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 145 (Ubuntu 24.04 LTS)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 143 (Fedora 43)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Firefox on Linux (2026)
          {
            name: 'Firefox 144 (Ubuntu 26.04 LTS)',
            ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 144 (Fedora 43)',
            ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 142 (Linux)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0',
            touchPoints: 0
          }
        ]
      }
    }
  },
  gaming: {
    name: 'Gaming Devices',
    icon: 'gaming',
    platforms: {
      console: {
        name: 'Gaming Consoles',
        variants: [
          // Latest PlayStation consoles (2026)
          {
            name: 'PlayStation 5 Pro (System 10.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/10.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'PlayStation 5 (System 9.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/9.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
            touchPoints: 0
          },
          // Nintendo Switch consoles (2026)
          {
            name: 'Nintendo Switch 2',
            ua: 'Mozilla/5.0 (Nintendo Switch; WebApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/9.0.0.25.1 NintendoBrowser/7.0.0.25000',
            touchPoints: 10
          },
          {
            name: 'Nintendo Switch',
            ua: 'Mozilla/5.0 (Nintendo Switch; WebApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/8.0.0.24.1 NintendoBrowser/6.0.0.24000',
            touchPoints: 10
          },
          // Xbox consoles (2026)
          {
            name: 'Xbox Series X',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edge/44.18363.8231',
            touchPoints: 0
          },
          {
            name: 'Xbox Series S',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series S) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edge/44.18363.8231',
            touchPoints: 0
          }
        ]
      },
      handheld: {
        name: 'Gaming Handhelds',
        variants: [
          // Latest Steam Deck models (2026)
          {
            name: 'Steam Deck OLED 2 (SteamOS 4.0)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Steam Deck OLED',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          // ROG Ally series (2026)
          {
            name: 'ROG Ally 2 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'ROG Ally X (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          // Lenovo Legion Go & MSI Claw
          {
            name: 'Lenovo Legion Go 2 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'MSI Claw 8 AI+ (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            touchPoints: 10
          }
        ]
      }
    }
  }
};

// 4.0 Client Hints & Metadata Generator Helpers
function getClientHintsForUA(ua) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  let platform = 'Windows';
  let architecture = 'x86';
  let bitness = '64';
  let model = '';
  let brandName = 'Google Chrome';
  let version = '146.0.0.0';
  let majorVersion = '146';

  if (ua.includes('Windows')) {
    platform = 'Windows';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    platform = 'macOS';
    architecture = 'arm';
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    platform = 'iOS';
    architecture = 'arm';
    model = ua.includes('iPad') ? 'iPad' : 'iPhone';
  } else if (ua.includes('Android')) {
    platform = 'Android';
    architecture = 'arm';
    if (ua.includes('Surface Duo')) model = 'Surface Duo';
    else if (ua.includes('Pixel')) model = 'Pixel';
    else if (ua.includes('SM-')) model = 'Galaxy';
  } else if (ua.includes('Linux')) {
    platform = 'Linux';
  }

  // Extract browser version
  const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
  const firefoxMatch = ua.match(/Firefox\/([0-9.]+)/);
  const edgeMatch = ua.match(/Edg\/([0-9.]+)/) || ua.match(/EdgA\/([0-9.]+)/) || ua.match(/EdgiOS\/([0-9.]+)/);
  const safariMatch = ua.match(/Version\/([0-9.]+).*Safari/);

  if (edgeMatch) {
    brandName = 'Microsoft Edge';
    version = edgeMatch[1];
    majorVersion = version.split('.')[0];
  } else if (chromeMatch) {
    brandName = 'Google Chrome';
    version = chromeMatch[1];
    majorVersion = version.split('.')[0];
  } else if (firefoxMatch) {
    brandName = 'Mozilla Firefox';
    version = firefoxMatch[1];
    majorVersion = version.split('.')[0];
  } else if (safariMatch) {
    brandName = 'Safari';
    version = safariMatch[1];
    majorVersion = version.split('.')[0];
  }

  const brands = [
    { brand: 'Not(A:Brand', version: '99' },
    { brand: brandName, version: majorVersion },
    { brand: 'Chromium', version: majorVersion }
  ];

  const fullVersionList = [
    { brand: 'Not(A:Brand', version: '99.0.0.0' },
    { brand: brandName, version: version },
    { brand: 'Chromium', version: version }
  ];

  return {
    brands,
    mobile: isMobile,
    platform,
    platformVersion: '16.0.0',
    architecture,
    bitness,
    model,
    fullVersionList,
    uaFullVersion: version,
    secChUaHeader: `"${brands[0].brand}";v="${brands[0].version}", "${brands[1].brand}";v="${brands[1].version}", "${brands[2].brand}";v="${brands[2].version}"`,
    secChUaMobileHeader: isMobile ? '?1' : '?0',
    secChUaPlatformHeader: `"${platform}"`
  };
}

function getScreenSpecsForUA(ua, category) {
  const isMobile = /iPhone|Mobile|Android/i.test(ua) && !/iPad|Tablet/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua) || (category === 'tablet');

  if (ua.includes('Surface Duo')) {
    // Surface Duo Dual-Screen specs
    return {
      width: 540,
      height: 720,
      availWidth: 540,
      availHeight: 720,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 2.5,
      orientation: { type: 'portrait-primary', angle: 0 }
    };
  } else if (isMobile) {
    return {
      width: 393,
      height: 852,
      availWidth: 393,
      availHeight: 852,
      colorDepth: 30,
      pixelDepth: 30,
      devicePixelRatio: 3,
      orientation: { type: 'portrait-primary', angle: 0 }
    };
  } else if (isTablet) {
    return {
      width: 1024,
      height: 1366,
      availWidth: 1024,
      availHeight: 1366,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 2,
      orientation: { type: 'portrait-primary', angle: 0 }
    };
  } else {
    return {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 1,
      orientation: { type: 'landscape-primary', angle: 0 }
    };
  }
}

function getWebGLSpecsForUA(ua) {
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('Macintosh')) {
    return {
      vendor: 'Apple Inc.',
      renderer: 'Apple M5 GPU'
    };
  } else if (ua.includes('Android')) {
    return {
      vendor: 'Qualcomm',
      renderer: 'Adreno (TM) 830'
    };
  } else {
    return {
      vendor: 'Google Inc. (NVIDIA)',
      renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 Direct3D11 vs_5_0 ps_5_0, D3D11)'
    };
  }
}

// Legacy profiles array for backward compatibility
const legacyProfiles = [];
Object.keys(profiles).forEach(category => {
  Object.keys(profiles[category].platforms || {}).forEach(platform => {
    profiles[category].platforms[platform].variants.forEach(variant => {
      legacyProfiles.push({
        name: variant.name,
        ua: variant.ua,
        category: category,
        platform: platform,
        touchPoints: variant.touchPoints || 0
      });
    });
  });
});

// Export both new structure and legacy compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { profiles, legacyProfiles, browserTypes, getClientHintsForUA, getScreenSpecsForUA, getWebGLSpecsForUA };
} else {
  // For browser environment, maintain backward compatibility
  window.profiles = profiles;
  window.profilesStructured = profiles;
  window.browserTypes = browserTypes;
  window.getClientHintsForUA = getClientHintsForUA;
  window.getScreenSpecsForUA = getScreenSpecsForUA;
  window.getWebGLSpecsForUA = getWebGLSpecsForUA;
}
