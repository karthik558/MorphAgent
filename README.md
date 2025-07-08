

<div align="center">

<img src="icons/icon.png" alt="Icon" width="96" height="96" />

# MorphAgent

> **Modern User Agent & Touch Spoofer Extension**  
> Professional-grade browser spoofing for Firefox

![Version](https://img.shields.io/badge/version-2.0.0-black.svg?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-Manifest-black.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-black.svg?style=flat-square)
</div>

## 📑 **Table of Contents**

- [Key Features](#key-features)
- [Browser Compatibility](#browser-compatibility) 
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Special Features](#special-features)
- [Device Database](#device-database)
- [Known Limitations](#known-limitations)
- [Development](#development)
- [License](#license)
- [Author](#author)

---

## Key Features

### Modern Interface
- Dark/light themes with smooth transitions
- Responsive device grid with intuitive category selection
- Advanced settings page for power users
- Professional SVG iconography throughout

### Advanced Spoofing
- User Agent switching with 70+ modern profiles
- Touch point spoofing with customizable `maxTouchPoints`
- Per-website rules for automatic profile switching
- Block list support to disable spoofing on specific sites

### Comprehensive Profiles
- Latest devices: iPhone 15 Pro Max, Galaxy S24 Ultra, iPad Pro M4
- Modern browsers: Chrome 123+, Firefox 124+, Safari 17.4+
- Current OS versions: iOS 17.4, Android 14, Windows 11, macOS Sonoma
- Legacy support: Older devices and browsers included

---

## Browser Compatibility

| Browser | Support | Manifest | Status | Notes |
|---------|---------|----------|---------|-------|
| **Firefox** | ✅ **Full Support** | V2 | **Recommended** | Complete API access |
| **Chrome** | ❌ Not Supported | V3 | Limited | API restrictions |
| **Edge** | ❌ Not Supported | V3 | Limited | API restrictions |
| **Safari** | ❌ Not Supported | - | No Support | WebExtension limitations |

> **⚠️ Important**: MorphAgent is designed exclusively for **Firefox** with Manifest V2. Chromium-based browsers (Chrome, Edge, Brave, etc.) use Manifest V3, which severely restricts the APIs needed for comprehensive user agent spoofing. Only Firefox provides the necessary permissions and APIs for full functionality.

---

## Installation

### Firefox (Recommended)
1. **Download**: Clone or download this repository
   ```bash
   git clone https://github.com/karthik558/MorphAgent.git
   ```
2. **Load Extension**: Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. **Install**: Click **"Load Temporary Add-on..."**
4. **Select**: Choose the `manifest.json` file from the downloaded folder
5. **Verify**: The MorphAgent icon should appear in your Firefox toolbar

---

## Usage Guide

### Quick Start (30 seconds)
1. Click the MorphAgent icon in your Firefox toolbar
2. Select device category: Mobile, Tablet, or Desktop  
3. Choose specific profile from the interactive device grid
4. Toggle touch spoofing (automatically sets appropriate touch points)
5. Apply changes - refresh pages to see the new user agent

### Advanced Configuration
Click **"Advanced Settings"** in the popup for power-user features:

- Custom User Agents: Enter any UA string manually  
- Touch Point Control: Fine-tune maxTouchPoints (0-20)
- Website Rules: Set automatic profiles for specific domains
- Block List: Disable spoofing on banking/sensitive sites  
- Import/Export: Backup and share your configuration

### Pro Tips
- Use wildcard patterns in website rules: `*.example.com`
- Block sensitive sites like banking to avoid security issues
- Export settings before major changes as backup
- Reset everything via Advanced Settings if issues occur

---

## Special Features

### Smart Touch Spoofing
```javascript
// Automatically detects and sets appropriate touch points
Mobile devices: 5-10 touch points
Tablets: 10 touch points  
Desktop: 0 touch points (no touch)
Custom: 0-20 configurable
```

### Per-Website Rules
- Automatic switching based on domain patterns
- Wildcard support for subdomain matching
- Priority system for rule conflicts
- Touch point overrides per website

### Privacy & Security
- Local storage only - no data collection
- Block list protection for sensitive sites
- Secure settings export with encryption option
- Reset functionality for clean slate

---

## Device Database

### Mobile Devices (20+ profiles)
- iPhone 15 Pro Max/Pro (iOS 17.4)
- iPhone 14 series (iOS 17.3)
- Samsung Galaxy S24 Ultra/Plus (Android 14)
- Google Pixel 8 Pro/8 (Android 14)
- OnePlus 12, Xiaomi 14 Ultra
- Nothing Phone (2a), Sony Xperia 1 VI

### Tablets (15+ profiles)
- iPad Pro 12.9"/11" M4 (iPadOS 17.4)
- iPad Air M2 (iPadOS 17.4)
- Samsung Galaxy Tab S9 series
- Microsoft Surface Pro 10
- Lenovo Tab P12 Pro

### Desktop (35+ profiles)
- Chrome 123+ (Windows 11, macOS, Linux)
- Firefox 124+ (All platforms)
- Safari 17.4+ (macOS Sonoma)
- Edge 123+ (Windows, macOS)
- Opera, Brave, Arc browsers

---

## Known Limitations

| Limitation | Impact | Solution/Workaround |
|------------|---------|---------------------|
| **Chromium Manifest V3** | Cannot modify User-Agent headers | **Use Firefox exclusively** |
| **Advanced Fingerprinting** | Some sites detect spoofing anyway | Combine with VPN + privacy tools |
| **Touch API Scope** | Only affects `navigator.maxTouchPoints` | Sufficient for most use cases |
| **Extension Detection** | Sites may block extensions | Use private/incognito mode |
| **JavaScript Fingerprinting** | Screen size, timezone, etc. not spoofed | Use comprehensive privacy setup |

### Why Firefox Only?
- **Manifest V2**: Full access to `webRequest` API for header modification
- **Manifest V3**: Chromium's restrictions prevent User-Agent header changes
- **API Permissions**: Firefox provides necessary extension capabilities
- **Future-Proof**: Firefox committed to supporting essential privacy tools

---

## Development

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Firefox
5. Submit a pull request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License** - Free to use, modify, and distribute

---

## Author

**Developed by KARTHIK LAL**
- GitHub: [@karthik558](https://github.com/karthik558)
- Design: Modern interface with dark/light themes
- Features: Advanced per-site spoofing capabilities  
- Database: Comprehensive device profile collection (70+ profiles)
- UX: Enhanced user experience and professional polish

---

<div align="center">

**Built with ❤️ for developers who value browser privacy and testing**

*MorphAgent - Transform your browser identity with professional-grade spoofing*

**⭐ Star this repo if MorphAgent helps your development workflow!**

</div>