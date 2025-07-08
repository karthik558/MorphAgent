// Enhanced Device/Browser Profiles for UA Spoofing (2025 Edition)
// Organized by categories with platform subcategories

const profiles = {
  mobile: {
    name: 'Mobile Devices',
    icon: 'mobile',
    platforms: {
      ios: {
        name: 'iOS Devices',
        variants: [
          {
            name: 'iPhone 16 Pro Max (iOS 18.5)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 16 Pro (iOS 18.3.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 16 Plus (iOS 18.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 16 (iOS 18.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Pro Max (iOS 18.3)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Pro (iOS 18.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Plus (iOS 17.7)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 (iOS 17.6)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Pro Max (iOS 17.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 15 Pro (iOS 17.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 14 Pro Max (iOS 17.5)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 14 Pro (iOS 17.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 14 Pro Max (iOS 17.3)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 13 Pro Max (iOS 17.3)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 13 Pro (iOS 17.2)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 12 Pro Max (iOS 16.7)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.7 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 11 Pro (iOS 15.8)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone X (iOS 14.8)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.8 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone 8 Plus (iOS 13.7)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.7 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          },
          {
            name: 'iPhone SE 3rd Gen (iOS 17.4)',
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 5
          }
        ]
      },
      android: {
        name: 'Android Devices',
        variants: [
          // Latest 2025 Samsung Devices
          {
            name: 'Samsung Galaxy S25 Ultra (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S25 Plus (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S936B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S25 (One UI 7.1)',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Samsung S24 Series (updated)
          {
            name: 'Samsung Galaxy S24 Ultra (One UI 6.1)',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S24 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-S926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Older Samsung flagships
          {
            name: 'Samsung Galaxy S23 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S22 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 12; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S21 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Note 20 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 10; SM-N986B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest Google Pixel Devices (2025)
          {
            name: 'Google Pixel 9 Pro XL (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 9 Pro (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 9 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Updated Pixel 8 Series
          {
            name: 'Google Pixel 8 Pro (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 8',
            ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Older Pixel devices
          {
            name: 'Google Pixel 7 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 6 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 5',
            ua: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
          // Latest OnePlus Devices
          {
            name: 'OnePlus 13 (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; CPH2649) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus 12 (Android 14)',
            ua: 'Mozilla/5.0 (Linux; Android 14; CPH2581) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus 11',
            ua: 'Mozilla/5.0 (Linux; Android 13; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'OnePlus 10 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 12; NE2213) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          // Latest Xiaomi Devices
          {
            name: 'Xiaomi 15 Ultra (Android 15)',
            ua: 'Mozilla/5.0 (Linux; Android 15; 2405CPH4DH) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 14 Pro (Android 14)',
            ua: 'Mozilla/5.0 (Linux; Android 14; 2210132C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 14 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; 2405CPH3DH) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Xiaomi 13 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 13; 2210132C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
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
          // Latest 2025 iPad Models
          {
            name: 'iPad Pro 13" M4 (iPadOS 18.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 11" M4 (iPadOS 18.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1',
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
            name: 'iPad Pro 12.9" M4 (iPadOS 17.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 12.9" M2 (iPadOS 17.7)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 12.9" M2 (iPadOS 16.7)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.7 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 11" M1 (iPadOS 15.8)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air 5th Gen (iPadOS 16.7)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.7 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Air M2 (iPadOS 17.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad 10th Gen (iPadOS 17.6)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad 10th Gen (iPadOS 17.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad 9th Gen (iPadOS 15.8)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Mini 6th Gen (iPadOS 17.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          }
        ]
      },
      android: {
        name: 'Android Tablets',
        variants: [
          // Latest Samsung Galaxy Tab Models
          {
            name: 'Samsung Galaxy Tab S10 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-X926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S10 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 15; SM-X826B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S9 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S9 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-X816B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Lenovo Tab P12 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 14; TB-Q706F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            touchPoints: 10
          }
        ]
      },
      windows: {
        name: 'Windows Tablets',
        variants: [
          // Latest Surface Pro Models
          {
            name: 'Microsoft Surface Pro 11',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edge/138.0.0.0',
            touchPoints: 10
          },
          {
            name: 'Microsoft Surface Pro 10',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edge/137.0.0.0',
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
          // Latest Chrome versions for Windows
          {
            name: 'Chrome 139 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 138 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 137 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 123 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 121 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 118 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 115 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Edge versions for Windows
          {
            name: 'Edge 138 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 137 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 123 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 121 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 118 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
            touchPoints: 0
          },
          // Latest Firefox versions for Windows
          {
            name: 'Firefox 136 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 135 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 124 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 121 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 118 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
            touchPoints: 0
          },
          // Latest Opera versions for Windows
          {
            name: 'Opera 111 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/111.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Opera 108 (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Opera 105 (Windows 10)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
            touchPoints: 0
          }
        ]
      },
      macos: {
        name: 'macOS',
        variants: [
          // Latest Safari versions for macOS
          {
            name: 'Safari 18.4 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 18.3 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 17.6 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 17.4 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 16.6 (macOS Ventura)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Safari 15.6 (macOS Monterey)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15',
            touchPoints: 0
          },
          // Latest Chrome versions for macOS
          {
            name: 'Chrome 139 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 138 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 123 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 121 (macOS Ventura)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 118 (macOS Monterey)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Latest Firefox versions for macOS
          {
            name: 'Firefox 136 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:136.0) Gecko/20100101 Firefox/136.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 124 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Firefox/124.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 121 (macOS Ventura)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13.6; rv:121.0) Gecko/20100101 Firefox/121.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 118 (macOS Monterey)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12.6; rv:118.0) Gecko/20100101 Firefox/118.0',
            touchPoints: 0
          },
          // Latest Edge versions for macOS
          {
            name: 'Edge 138 (macOS Sequoia)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 123 (macOS Sonoma)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
            touchPoints: 0
          },
          {
            name: 'Edge 121 (macOS Ventura)',
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
            touchPoints: 0
          }
        ]
      },
      linux: {
        name: 'Linux',
        variants: [
          // Latest Firefox versions for Linux
          {
            name: 'Firefox 136 (Ubuntu 24.04)',
            ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 135 (Fedora 40)',
            ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 124 (Ubuntu 22.04)',
            ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
            touchPoints: 0
          },
          {
            name: 'Firefox 123 (Fedora 39)',
            ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
            touchPoints: 0
          },
          // Latest Chrome versions for Linux
          {
            name: 'Chrome 139 (Ubuntu 24.04)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Chrome 123 (Ubuntu 22.04)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          // Other browsers for Linux
          {
            name: 'Brave 1.71 (Arch Linux)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Brave 1.63 (Arch Linux)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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
          // Latest PlayStation consoles
          {
            name: 'PlayStation 5 (System 8.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/8.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'PlayStation 5 (System 7.00)',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/7.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'PlayStation 5',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/6.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
            touchPoints: 0
          },
          // Xbox consoles
          {
            name: 'Xbox Series X',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edge/44.18363.8131',
            touchPoints: 0
          },
          {
            name: 'Xbox Series S',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series S) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edge/44.18363.8131',
            touchPoints: 0
          },
          // Nintendo Switch consoles
          {
            name: 'Nintendo Switch 2',
            ua: 'Mozilla/5.0 (Nintendo Switch; WebApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/7.0.0.23.1 NintendoBrowser/5.2.0.23000',
            touchPoints: 10
          },
          {
            name: 'Nintendo Switch',
            ua: 'Mozilla/5.0 (Nintendo Switch; WebApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/6.0.2.21.3 NintendoBrowser/5.1.0.22474',
            touchPoints: 10
          }
        ]
      },
      handheld: {
        name: 'Gaming Handhelds',
        variants: [
          // Latest Steam Deck models
          {
            name: 'Steam Deck OLED',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Steam Deck (LCD)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/Steam Deck [Steam Deck Stable]/default/0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Steam Deck',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Valve Steam GameOverlay/1.0',
            touchPoints: 10
          },
          // ROG Ally series
          {
            name: 'ROG Ally X (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'ROG Ally (Windows 11)',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'ROG Ally',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          // Lenovo Legion Go
          {
            name: 'Lenovo Legion Go',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
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
  module.exports = { profiles, legacyProfiles };
} else {
  // For browser environment, maintain backward compatibility
  window.profiles = legacyProfiles;
  window.profilesStructured = profiles;
}
