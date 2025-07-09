

<div align="center">

<img src="icons/icon.png" alt="Icon" width="96" height="96" />

# MorphAgent

> **Modern User Agent & Touch Spoofer Extension**  
> Professional-grade browser spoofing for Firefox

![Version](https://img.shields.io/badge/version-2.0.0-black.svg?style=flat-square)
![Firefox](https://img.shields.io/badge/Firefox-Manifest-black.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-black.svg?style=flat-square)

</div>

## **Screenshots**

<div align="center">

<table>
   <tr>
      <th colspan="2" style="text-align:center; font-size:1.1em;">Main Interface (Light & Dark Mode)</th>
   </tr>
   <tr>
      <td>
         <img src="src/home_light.png" alt="Light Mode Interface" width="300" />
         <div>Light Mode</div>
      </td>
      <td>
         <img src="src/home_dark.png" alt="Dark Mode Interface" width="300" />
         <div>Dark Mode</div>
      </td>
   </tr>
   <tr>
      <th colspan="2" style="text-align:center; font-size:1.1em;">Touch Points Configuration</th>
   </tr>
   <tr>
      <td>
         <img src="src/touchpoints_light.png" alt="Touch Points Light" width="300" />
         <div>Touch Points (Light)</div>
      </td>
      <td>
         <img src="src/touchpoints_dark.png" alt="Touch Points Dark" width="300" />
         <div>Touch Points (Dark)</div>
      </td>
   </tr>
</table>

</div>

---

## **Key Features**

### Modern Interface
- Dark/light themes with smooth transitions
- Responsive device grid with intuitive category selection
- Advanced settings page for power users

### Advanced Spoofing
- User Agent switching with 70+ modern profiles
- Touch point spoofing with customizable `maxTouchPoints`
- Per-website rules for automatic profile switching
- Block list support to disable spoofing on sensitive sites

### Comprehensive Profiles
- Latest devices: iPhone 16 Pro Max, Galaxy S25 Ultra, iPad Pro M4
- Modern browsers: Chrome 139+, Firefox 136+, Safari 18.4+
- Current OS versions: iOS 18.4, Android 15, Windows 11, macOS Sequoia

---

## **Installation**

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

## **Quick Start**

1. Click the MorphAgent icon in your Firefox toolbar
2. Select device category: Mobile, Tablet, Desktop, or Gaming  
3. Choose specific profile from the device grid
4. Toggle touch spoofing (automatically sets appropriate touch points)
5. Apply changes - refresh pages to see the new user agent

### Advanced Configuration
Click **"Advanced Settings"** for power-user features:
- Custom User Agents: Enter any UA string manually  
- Website Rules: Set automatic profiles for specific domains
- Block List: Disable spoofing on banking/sensitive sites  
- Import/Export: Backup and share your configuration

---

## **Device Database**

### Mobile Devices (30+ profiles)
- iPhone 16 Pro Max/Pro (iOS 18.5)
- Samsung Galaxy S25 Ultra/Plus (Android 15)
- Google Pixel 9 Pro (Android 15)
- OnePlus 13, Xiaomi 15 Ultra

### Tablets (15+ profiles)
- iPad Pro 13"/11" M4 (iPadOS 18.4)
- Samsung Galaxy Tab S10 Ultra
- Microsoft Surface Pro 11

### Desktop (35+ profiles)
- Chrome 139+ (Windows 11, macOS, Linux)
- Firefox 136+ (All platforms)
- Safari 18.4+ (macOS Sequoia)
- Edge 138+ (Windows, macOS)

### Gaming Devices (10+ profiles)
- PlayStation 5, Xbox Series X
- Steam Deck, ROG Ally X
- Nintendo Switch

---

## **Privacy & Security**

- **Local Storage Only** - No data collection or tracking
- **Block List Protection** - Secure banking and sensitive sites
- **Open Source** - Full transparency and community auditing
- **Permissions Minimal** - Only requests necessary browser APIs

---

## **Known Limitations**

- **Firefox Only**: Designed exclusively for Firefox with Manifest V2
- **Content Security Policy**: Some sites may detect spoofing attempts
- **Touch API Scope**: Only affects `navigator.maxTouchPoints`
- **Banking Sites**: Recommended to use block list for financial websites

---

## **Development**

### Contributing
1. Fork the repository
2. Create a feature branch
3. Test on Firefox
4. Submit a pull request

### Project Structure
```
MorphAgent/
├── manifest.json          # Extension manifest
├── popup.html/css/js/     # Main interface
├── advanced-settings.*    # Advanced configuration
├── js/profiles.js         # Device database
└── js/background.js       # Core spoofing logic
```

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