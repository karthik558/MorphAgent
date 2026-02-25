// Enhanced Device/Browser Profiles for UA Spoofing (2026 Edition)
// Organized by categories with platform subcategories

// Browser types with their typical patterns
const browserTypes = {
  all: {
    name: 'All Browsers',
    icon: 'all',
    pattern: '',
    platforms: ['all']
  },
  chrome: {
    name: 'Google Chrome',
    icon: 'chrome',
    pattern: 'Chrome',
    platforms: ['all']
  },
  firefox: {
    name: 'Mozilla Firefox', 
    icon: 'firefox',
    pattern: 'Firefox',
    platforms: ['all']
  },
  safari: {
    name: 'Safari',
    icon: 'safari', 
    pattern: 'Safari',
    platforms: ['ios', 'macos'] // Only show Safari on Apple devices
  },
  edge: {
    name: 'Microsoft Edge',
    icon: 'edge',
    pattern: 'Edg',
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
          // Latest 2026 iPhone 17 Series
          {
            name: 'iPhone 17 Pro Max (iOS 26.3)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Pro (iOS 26.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Air (iOS 26.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 Plus (iOS 26.1)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 17 (iOS 26.1)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 16 Series (updated to iOS 26)
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
            name: 'iPhone 16 Plus (iOS 18.5)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 16 (iOS 18.5)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // iPhone 15 Series
          {
            name: 'iPhone 15 Pro Max (iOS 18.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Pro (iOS 18.3)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Plus (iOS 18.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 (iOS 18.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          // Older iPhones
          {
            name: 'iPhone 14 Pro Max (iOS 18.1)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 14 Pro (iOS 17.7)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 13 Pro Max (iOS 17.7)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 13 Pro (iOS 17.6)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 12 Pro Max (iOS 17.7)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone SE 4th Gen (iOS 26.1)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone SE 3rd Gen (iOS 18.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          }
        ]
      },
      android: {
        name: 'Android Devices',
        variants: [
          // Latest 2026 Samsung Devices
          {
            name: 'Samsung Galaxy S26 Ultra (One UI 8)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-S948B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S26 Plus (One UI 8)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-S946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S26 (One UI 8)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-S941B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Samsung Galaxy Z Fold & Flip 2026
          {
            name: 'Samsung Galaxy Z Fold 7 (One UI 8)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-F968B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Z Flip 7 (One UI 8)',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-F758B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Samsung S25 Series (updated)
          {
            name: 'Samsung Galaxy S25 Ultra (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S25 Plus (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S936B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S25 (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Samsung S24 Series
          {
            name: 'Samsung Galaxy S24 Ultra (One UI 7)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S23 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest Google Pixel Devices (2026)
          {
            name: 'Google Pixel 10 Pro XL (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 10 Pro (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 10 (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Pixel 9 Series (updated)
          {
            name: 'Google Pixel 9 Pro XL (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 9 Pro (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 9 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Pixel 8 Series
          {
            name: 'Google Pixel 8 Pro (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 8 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Older Pixel devices
          {
            name: 'Google Pixel 7 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest OnePlus Devices (2026)
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
          {
            name: 'OnePlus 12 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; CPH2581) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus 11',
            ua: 'Mozilla/5.0 (Linux; Android 14; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest Xiaomi Devices (2026)
          {
            name: 'Xiaomi 16 Ultra (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; 2506CPX5DH) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 15 Ultra (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; 2405CPH4DH) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 15 Pro (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; 2501CPX3DG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 14 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; 2405CPH3DH) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Nothing Phone
          {
            name: 'Nothing Phone (3) (Android 16)',
            ua: 'Mozilla/5.0 (Linux; Android 16; A069) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36',
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
            name: 'iPad Pro 13" M5 (iPadOS 26.2)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 11" M5 (iPadOS 26.2)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 13" M3 (iPadOS 26.1)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 11" M3 (iPadOS 26.1)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          // 2025 iPad Models (updated)
          {
            name: 'iPad Pro 13" M4 (iPadOS 18.5)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 11" M4 (iPadOS 18.5)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 13" M2 (iPadOS 18.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 11" M2 (iPadOS 18.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Mini 7th Gen (iPadOS 18.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          // Older iPad Models
          {
            name: 'iPad Pro 12.9" M2 (iPadOS 17.7)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad 10th Gen (iPadOS 18.2)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Mini 6th Gen (iPadOS 18.2)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          }
        ]
      },
      android: {
        name: 'Android Tablets',
        variants: [
          // Latest Samsung Galaxy Tab Models (2026)
          {
            name: 'Samsung Galaxy Tab S11 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-X936B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S11 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 16; SM-X836B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S10 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-X926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S10 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-X826B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S9 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
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
          // Latest Surface Pro Models
          {
            name: 'Microsoft Surface Pro 12',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Microsoft Surface Pro 11',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Microsoft Surface Pro 10',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
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
            name: 'Chrome 141 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 139 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 137 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Edge versions for Windows (2026)
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
          {
            name: 'Edge 141 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 139 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
            touchPoints: 0
          },
          // Latest Firefox versions for Windows (2026)
          {
            name: 'Firefox 142 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 140 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 138 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 136 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
            touchPoints: 0
          },
          // Latest Opera versions for Windows (2026)
          {
            name: 'Opera 117 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 OPR/117.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Opera 114 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/114.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Opera 111 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/111.0.0.0',
            touchPoints: 0
          }
        ]
      },
      macos: {
        name: 'macOS',
        variants: [
          // Latest Safari versions for macOS (2026)
          {
            name: 'Safari 26.3 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 26.2 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 18.4 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 18.3 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 17.6 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
            touchPoints: 0
          },
          // Latest Chrome versions for macOS (2026)
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
          {
            name: 'Chrome 141 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 139 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Firefox versions for macOS (2026)
          {
            name: 'Firefox 142 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26.3; rv:142.0) Gecko/20100101 Firefox/142.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 140 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15.7; rv:140.0) Gecko/20100101 Firefox/140.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 138 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15.4; rv:138.0) Gecko/20100101 Firefox/138.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 136 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:136.0) Gecko/20100101 Firefox/136.0',
            touchPoints: 0
          },
          // Latest Edge versions for macOS (2026)
          {
            name: 'Edge 145 (macOS Tahoe)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 26_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 143 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 141 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
            touchPoints: 0
          }
        ]
      },
      linux: {
        name: 'Linux',
        variants: [
          // Latest Firefox versions for Linux (2026)
          {
            name: 'Firefox 142 (Ubuntu 24.10)',
            ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 140 (Fedora 42)',
            ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 138 (Ubuntu 24.04)',
            ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 136 (Fedora 41)',
            ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0',
            touchPoints: 0
          },
          // Latest Chrome versions for Linux (2026)
          {
            name: 'Chrome 145 (Ubuntu 24.10)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 143 (Ubuntu 24.04)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 139 (Ubuntu 22.04)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Other browsers for Linux
          {
            name: 'Brave 1.78 (Arch Linux)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Brave 1.74 (Arch Linux)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
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
            name: 'PlayStation 5 Pro (System 9.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/9.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'PlayStation 5 (System 9.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/9.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'PlayStation 5 (System 8.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/8.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
            touchPoints: 0
          },
          // Xbox consoles (2026)
          {
            name: 'Xbox Series X',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edge/44.18363.8231',
            touchPoints: 0
          },
          {
            name: 'Xbox Series S',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series S) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edge/44.18363.8231',
            touchPoints: 0
          },
          // Nintendo Switch consoles (2026)
          {
            name: 'Nintendo Switch 2',
            ua: 'Mozilla/5.0 (Nintendo Switch; WebApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/8.0.0.24.1 NintendoBrowser/6.0.0.24000',
            touchPoints: 10
          },
          {
            name: 'Nintendo Switch',
            ua: 'Mozilla/5.0 (Nintendo Switch; WebApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/7.0.0.23.1 NintendoBrowser/5.2.0.23000',
            touchPoints: 10
          }
        ]
      },
      handheld: {
        name: 'Gaming Handhelds',
        variants: [
          // Latest Steam Deck models (2026)
          {
            name: 'Steam Deck OLED 2',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Steam Deck OLED',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Steam Deck (LCD)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          // ROG Ally series (2026)
          {
            name: 'ROG Ally 2 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'ROG Ally X (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'ROG Ally (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          // Lenovo Legion Go
          {
            name: 'Lenovo Legion Go S',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Lenovo Legion Go',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          // MSI Claw
          {
            name: 'MSI Claw 8 AI+',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            touchPoints: 10
          }
        ]
      }
    }
  }
};

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
  module.exports = { profiles, legacyProfiles, browserTypes };
} else {
  // For browser environment, maintain backward compatibility
  window.profiles = profiles;
  window.profilesStructured = profiles;
  window.browserTypes = browserTypes;
}
