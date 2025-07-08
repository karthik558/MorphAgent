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
            name: 'iPhone 14 Pro Max (iOS 17.3)',
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
          {
            name: 'Samsung Galaxy S24 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy S24 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-S926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
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
          {
            name: 'Google Pixel 8 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Google Pixel 8',
            ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            touchPoints: 5
          },
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
          {
            name: 'OnePlus 12',
            ua: 'Mozilla/5.0 (Linux; Android 14; CPH2581) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
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
          {
            name: 'iPad Pro 12.9" M4 (iPadOS 17.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            touchPoints: 10
          },
          {
            name: 'iPad Pro 11" M4 (iPadOS 17.4)',
            ua: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
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
          {
            name: 'Samsung Galaxy Tab S9 Ultra',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-X916B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Samsung Galaxy Tab S9 Plus',
            ua: 'Mozilla/5.0 (Linux; Android 14; SM-X816B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 10
          },
          {
            name: 'Lenovo Tab P12 Pro',
            ua: 'Mozilla/5.0 (Linux; Android 13; TB-Q706F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            touchPoints: 10
          }
        ]
      },
      windows: {
        name: 'Windows Tablets',
        variants: [
          {
            name: 'Microsoft Surface Pro 10',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ARM64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edge/123.0.0.0',
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
          {
            name: 'Firefox 124 (Ubuntu 22.04)',
            ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
            touchPoints: 0
          },
          {
            name: 'Chrome 123 (Ubuntu 22.04)',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            touchPoints: 0
          },
          {
            name: 'Firefox 123 (Fedora 39)',
            ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
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
          {
            name: 'PlayStation 5',
            ua: 'Mozilla/5.0 (PlayStation; PlayStation 5/6.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
            touchPoints: 0
          },
          {
            name: 'Xbox Series X',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/44.18363.8131',
            touchPoints: 0
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
          {
            name: 'Steam Deck',
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Valve Steam GameOverlay/1.0',
            touchPoints: 10
          },
          {
            name: 'ROG Ally',
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
