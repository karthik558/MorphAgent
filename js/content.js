// content.js
// Injects code to spoof navigator.userAgent and maxTouchPoints if enabled (Firefox/Manifest V2)
// Also handles JavaScript blocking via inline script removal
// Also handles protection against JS-based UA detection

(function() {
  browser.storage.local.get(['selectedUA', 'touchSpoofEnabled', 'maxTouchPoints', 'jsBlockEnabled', 'jsProtectEnabled']).then((settings) => {
    if (settings.selectedUA) {
      injectUserAgentSpoof(settings.selectedUA);
    }
    if (settings.touchSpoofEnabled && typeof settings.maxTouchPoints === 'number') {
      injectTouchSpoof(settings.maxTouchPoints);
    }
    if (settings.jsBlockEnabled) {
      blockInlineJavaScript();
    }
    if (settings.jsProtectEnabled && settings.selectedUA) {
      injectDetectionProtection(settings.selectedUA, settings.maxTouchPoints || 0, !!settings.touchSpoofEnabled);
    }
  });

  // Also check for site-specific rules
  browser.storage.sync.get(['websiteRules']).then((result) => {
    const websiteRules = result.websiteRules || [];
    const currentHostname = window.location.hostname;
    
    for (const rule of websiteRules) {
      const rulePattern = rule.website.replace(/\*/g, '');
      if (currentHostname.includes(rulePattern)) {
        if (rule.jsBlocked) {
          blockInlineJavaScript();
        }
        if (rule.jsProtected && rule.userAgent) {
          injectDetectionProtection(rule.userAgent, rule.touchPoints || 0, (rule.touchPoints || 0) > 0);
        }
        break;
      }
    }
  });

  function injectUserAgentSpoof(ua) {
    const script = document.createElement('script');
    script.textContent = `
      (() => {
        try {
          // Extract appVersion from userAgent
          // appVersion typically contains everything after "Mozilla/"
          const extractAppVersion = (userAgent) => {
            const match = userAgent.match(/^Mozilla\\/(.*)/);
            return match ? match[1] : userAgent;
          };
          
          const customUA = ${JSON.stringify(ua)};
          const customAppVersion = extractAppVersion(customUA);
          
          // Spoof userAgent
          Object.defineProperty(Navigator.prototype, 'userAgent', {
            get: function() { return customUA; },
            configurable: true
          });
          
          // Spoof appVersion to match userAgent
          Object.defineProperty(Navigator.prototype, 'appVersion', {
            get: function() { return customAppVersion; },
            configurable: true
          });
          
          // Also spoof appName and platform for consistency
          const getPlatform = (ua) => {
            if (ua.includes('Windows')) return 'Win32';
            if (ua.includes('Mac OS X')) return 'MacIntel';
            if (ua.includes('Linux')) return 'Linux x86_64';
            if (ua.includes('Android')) return 'Linux armv7l';
            return 'unknown';
          };
          
          const getAppName = (ua) => {
            if (ua.includes('Firefox')) return 'Netscape';
            return 'Netscape'; // Most browsers use 'Netscape' for compatibility
          };
          
          Object.defineProperty(Navigator.prototype, 'platform', {
            get: function() { return getPlatform(customUA); },
            configurable: true
          });
          
          Object.defineProperty(Navigator.prototype, 'appName', {
            get: function() { return getAppName(customUA); },
            configurable: true
          });
          
        } catch (e) {
          console.warn('Failed to spoof navigator properties:', e);
          try { 
            window.navigator.userAgent = ${JSON.stringify(ua)}; 
          } catch (e2) {
            console.warn('Fallback userAgent spoofing failed:', e2);
          }
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  function injectTouchSpoof(maxTouchPoints) {
    const script = document.createElement('script');
    script.textContent = `
      (() => {
        try {
          Object.defineProperty(Navigator.prototype, 'maxTouchPoints', {
            get: function() { return ${maxTouchPoints}; },
            configurable: true
          });
        } catch (e) {
          try { window.navigator.maxTouchPoints = ${maxTouchPoints}; } catch (e2) {}
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  function blockInlineJavaScript() {
    // Block inline scripts by setting Content-Security-Policy via meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "script-src 'none'";
    document.documentElement.appendChild(meta);
    
    // Remove existing inline scripts
    const scripts = document.querySelectorAll('script:not([src])');
    scripts.forEach(script => script.remove());
    
    // Observe and remove dynamically added scripts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            node.remove();
            console.log('[UserAgent Extension] Blocked dynamic script injection');
          }
        });
      });
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    // Block event handlers on elements
    const blockEventScript = document.createElement('script');
    blockEventScript.textContent = '';
    
    console.log('[UserAgent Extension] Inline JavaScript blocking active');
  }

  function injectDetectionProtection(ua, maxTouchPoints, touchEnabled) {
    const script = document.createElement('script');
    script.textContent = `
      (() => {
        try {
          const customUA = ${JSON.stringify(ua)};
          
          // --- Helper: detect device/OS/browser from UA ---
          const isAndroid = customUA.includes('Android');
          const isiOS = customUA.includes('iPhone') || customUA.includes('iPad') || customUA.includes('iPod');
          const isMobile = isAndroid || isiOS || customUA.includes('Mobile');
          const isTablet = customUA.includes('iPad') || (customUA.includes('Android') && !customUA.includes('Mobile'));
          const isWindows = customUA.includes('Windows');
          const isMac = customUA.includes('Macintosh') || customUA.includes('Mac OS X');
          const isLinux = customUA.includes('Linux') && !isAndroid;
          const isChrome = customUA.includes('Chrome') && !customUA.includes('Edg') && !customUA.includes('OPR');
          const isFirefox = customUA.includes('Firefox');
          const isSafari = customUA.includes('Safari') && !customUA.includes('Chrome') && !customUA.includes('Edg');
          const isEdge = customUA.includes('Edg/') || customUA.includes('Edge/');
          const isOpera = customUA.includes('OPR/') || customUA.includes('Opera');
          
          // Extract versions
          const chromeVersionMatch = customUA.match(/Chrome\\/(\\d+)/);
          const chromeVersion = chromeVersionMatch ? parseInt(chromeVersionMatch[1]) : 0;
          const firefoxVersionMatch = customUA.match(/Firefox\\/(\\d+)/);
          const firefoxVersion = firefoxVersionMatch ? parseInt(firefoxVersionMatch[1]) : 0;
          
          // --- 1. Hide WebDriver flag ---
          Object.defineProperty(Navigator.prototype, 'webdriver', {
            get: function() { return false; },
            configurable: true
          });
          
          // Remove automation-related properties
          try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array; } catch(e) {}
          try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise; } catch(e) {}
          try { delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol; } catch(e) {}
          try { delete window.__webdriver_evaluate; } catch(e) {}
          try { delete window.__selenium_evaluate; } catch(e) {}
          try { delete window.__webdriver_script_function; } catch(e) {}
          try { delete window.__webdriver_script_func; } catch(e) {}
          try { delete window.__webdriver_script_fn; } catch(e) {}
          try { delete window.__fxdriver_evaluate; } catch(e) {}
          try { delete window.__driver_unwrapped; } catch(e) {}
          try { delete window.__webdriver_unwrapped; } catch(e) {}
          try { delete window.__driver_evaluate; } catch(e) {}
          try { delete window.__selenium_unwrapped; } catch(e) {}
          try { delete window.__fxdriver_unwrapped; } catch(e) {}
          try { delete document.__webdriver_evaluate; } catch(e) {}
          try { delete document.__selenium_evaluate; } catch(e) {}
          try { delete document.__webdriver_script_function; } catch(e) {}
          
          // --- 2. Spoof navigator.languages to match UA ---
          const getLanguages = () => {
            // Return realistic language arrays based on UA
            return ['en-US', 'en'];
          };
          
          Object.defineProperty(Navigator.prototype, 'languages', {
            get: function() { return Object.freeze(getLanguages()); },
            configurable: true
          });
          
          Object.defineProperty(Navigator.prototype, 'language', {
            get: function() { return 'en-US'; },
            configurable: true
          });
          
          // --- 3. Spoof navigator.vendor ---
          const getVendor = () => {
            if (isChrome || isEdge || isOpera || isSafari) return 'Google Inc.';
            if (isFirefox) return '';
            return 'Google Inc.';
          };
          
          Object.defineProperty(Navigator.prototype, 'vendor', {
            get: function() { return getVendor(); },
            configurable: true
          });
          
          Object.defineProperty(Navigator.prototype, 'vendorSub', {
            get: function() { return ''; },
            configurable: true
          });
          
          // --- 4. Spoof navigator.plugins & mimeTypes ---
          // Fake a realistic plugin list for Chrome/Edge
          const createFakePlugins = () => {
            if (isFirefox || isMobile) {
              // Firefox and mobile browsers have empty plugin arrays
              return { plugins: [], mimeTypes: [] };
            }
            
            const fakePluginsData = [
              {
                name: 'PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                  { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                  { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' }
                ]
              },
              {
                name: 'Chrome PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                  { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                  { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' }
                ]
              },
              {
                name: 'Chromium PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                  { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                  { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' }
                ]
              },
              {
                name: 'Microsoft Edge PDF Viewer',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                  { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                  { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' }
                ]
              },
              {
                name: 'WebKit built-in PDF',
                description: 'Portable Document Format',
                filename: 'internal-pdf-viewer',
                mimeTypes: [
                  { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                  { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' }
                ]
              }
            ];
            
            return { plugins: fakePluginsData, mimeTypes: fakePluginsData.flatMap(p => p.mimeTypes) };
          };
          
          const fakeData = createFakePlugins();
          
          // Create fake PluginArray-like object
          const fakePluginArray = Object.create(PluginArray.prototype);
          fakeData.plugins.forEach((p, i) => {
            const plugin = Object.create(Plugin.prototype);
            Object.defineProperties(plugin, {
              name: { get: () => p.name, enumerable: true },
              description: { get: () => p.description, enumerable: true },
              filename: { get: () => p.filename, enumerable: true },
              length: { get: () => p.mimeTypes.length, enumerable: true }
            });
            Object.defineProperty(fakePluginArray, i, { value: plugin, enumerable: true });
          });
          Object.defineProperty(fakePluginArray, 'length', { get: () => fakeData.plugins.length });
          Object.defineProperty(fakePluginArray, 'item', { value: function(i) { return this[i] || null; } });
          Object.defineProperty(fakePluginArray, 'namedItem', { value: function(name) { 
            for (let i = 0; i < this.length; i++) { if (this[i].name === name) return this[i]; }
            return null;
          }});
          
          Object.defineProperty(Navigator.prototype, 'plugins', {
            get: function() { return fakePluginArray; },
            configurable: true
          });
          
          // Create fake MimeTypeArray
          const fakeMimeTypeArray = Object.create(MimeTypeArray.prototype);
          fakeData.mimeTypes.forEach((m, i) => {
            const mimeType = Object.create(MimeType.prototype);
            Object.defineProperties(mimeType, {
              type: { get: () => m.type, enumerable: true },
              suffixes: { get: () => m.suffixes, enumerable: true },
              description: { get: () => m.description, enumerable: true }
            });
            Object.defineProperty(fakeMimeTypeArray, i, { value: mimeType, enumerable: true });
          });
          Object.defineProperty(fakeMimeTypeArray, 'length', { get: () => fakeData.mimeTypes.length });
          Object.defineProperty(fakeMimeTypeArray, 'item', { value: function(i) { return this[i] || null; } });
          Object.defineProperty(fakeMimeTypeArray, 'namedItem', { value: function(name) { 
            for (let i = 0; i < this.length; i++) { if (this[i].type === name) return this[i]; }
            return null;
          }});
          
          Object.defineProperty(Navigator.prototype, 'mimeTypes', {
            get: function() { return fakeMimeTypeArray; },
            configurable: true
          });
          
          // --- 5. Spoof navigator.hardwareConcurrency ---
          const getCores = () => {
            if (isMobile) return 8;
            if (isTablet) return 8;
            return navigator.hardwareConcurrency || 8;
          };
          
          Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
            get: function() { return getCores(); },
            configurable: true
          });
          
          // --- 6. Spoof navigator.deviceMemory ---
          const getMemory = () => {
            if (isMobile) return 4;
            if (isTablet) return 8;
            return 8;
          };
          
          if ('deviceMemory' in Navigator.prototype || isChrome || isEdge) {
            Object.defineProperty(Navigator.prototype, 'deviceMemory', {
              get: function() { return getMemory(); },
              configurable: true
            });
          }
          
          // --- 7. Spoof screen dimensions for device consistency ---
          const getScreenDimensions = () => {
            if (isiOS) {
              if (customUA.includes('iPhone 17 Pro Max') || customUA.includes('iPhone 16 Pro Max')) return { w: 430, h: 932, cd: 32 };
              if (customUA.includes('iPhone 17 Pro') || customUA.includes('iPhone 16 Pro')) return { w: 393, h: 852, cd: 32 };
              if (customUA.includes('iPhone 17') || customUA.includes('iPhone 16')) return { w: 390, h: 844, cd: 32 };
              if (customUA.includes('iPhone SE')) return { w: 375, h: 667, cd: 32 };
              return { w: 390, h: 844, cd: 32 };
            }
            if (isAndroid && isMobile) {
              if (customUA.includes('Galaxy S2')) return { w: 412, h: 915, cd: 32 };
              if (customUA.includes('Pixel')) return { w: 412, h: 915, cd: 32 };
              return { w: 412, h: 915, cd: 32 };
            }
            if (isTablet) {
              if (customUA.includes('iPad')) return { w: 1024, h: 1366, cd: 32 };
              return { w: 800, h: 1280, cd: 32 };
            }
            // Desktop: don't override, use real values
            return null;
          };
          
          const screenDims = getScreenDimensions();
          if (screenDims) {
            Object.defineProperty(screen, 'width', { get: () => screenDims.w, configurable: true });
            Object.defineProperty(screen, 'height', { get: () => screenDims.h, configurable: true });
            Object.defineProperty(screen, 'availWidth', { get: () => screenDims.w, configurable: true });
            Object.defineProperty(screen, 'availHeight', { get: () => screenDims.h, configurable: true });
            Object.defineProperty(screen, 'colorDepth', { get: () => screenDims.cd, configurable: true });
            Object.defineProperty(screen, 'pixelDepth', { get: () => screenDims.cd, configurable: true });
          }
          
          // --- 8. Canvas fingerprint protection ---
          // Add subtle noise to canvas toDataURL and toBlob to prevent fingerprinting
          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            const ctx = this.getContext('2d');
            if (ctx) {
              try {
                const imageData = ctx.getImageData(0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
                for (let i = 0; i < imageData.data.length; i += 4) {
                  // Add very subtle noise (+0 or +1) to RGB channels
                  imageData.data[i] = imageData.data[i] ^ (i % 3 === 0 ? 1 : 0);
                }
                ctx.putImageData(imageData, 0, 0);
              } catch(e) {
                // Canvas might be tainted, ignore
              }
            }
            return originalToDataURL.apply(this, args);
          };
          
          const originalToBlob = HTMLCanvasElement.prototype.toBlob;
          HTMLCanvasElement.prototype.toBlob = function(...args) {
            const ctx = this.getContext('2d');
            if (ctx) {
              try {
                const imageData = ctx.getImageData(0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
                for (let i = 0; i < imageData.data.length; i += 4) {
                  imageData.data[i] = imageData.data[i] ^ (i % 3 === 0 ? 1 : 0);
                }
                ctx.putImageData(imageData, 0, 0);
              } catch(e) {}
            }
            return originalToBlob.apply(this, args);
          };
          
          // --- 9. WebGL fingerprint protection ---
          const getWebGLInfo = () => {
            if (isMobile) {
              if (isAndroid) {
                return { vendor: 'Qualcomm', renderer: 'Adreno (TM) 750' };
              }
              if (isiOS) {
                return { vendor: 'Apple Inc.', renderer: 'Apple GPU' };
              }
            }
            if (isMac) {
              return { vendor: 'Apple Inc.', renderer: 'Apple M3 Pro' };
            }
            if (isWindows) {
              return { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)' };
            }
            if (isLinux) {
              return { vendor: 'Mesa', renderer: 'Mesa Intel(R) UHD Graphics 770 (ADL GT1)' };
            }
            return { vendor: 'Google Inc.', renderer: 'ANGLE (Unknown)' };
          };
          
          const webGLInfo = getWebGLInfo();
          
          const hookWebGLGetParameter = (proto) => {
            const originalGetParameter = proto.getParameter;
            proto.getParameter = function(param) {
              // UNMASKED_VENDOR_WEBGL
              if (param === 0x9245) return webGLInfo.vendor;
              // UNMASKED_RENDERER_WEBGL  
              if (param === 0x9246) return webGLInfo.renderer;
              // VENDOR
              if (param === 0x1F00) return webGLInfo.vendor;
              // RENDERER
              if (param === 0x1F01) return webGLInfo.renderer;
              return originalGetParameter.call(this, param);
            };
          };
          
          if (typeof WebGLRenderingContext !== 'undefined') {
            hookWebGLGetParameter(WebGLRenderingContext.prototype);
          }
          if (typeof WebGL2RenderingContext !== 'undefined') {
            hookWebGLGetParameter(WebGL2RenderingContext.prototype);
          }
          
          // --- 10. Consistent connection info ---
          if ('connection' in Navigator.prototype || navigator.connection) {
            const connObj = navigator.connection || {};
            const fakeConn = {
              effectiveType: isMobile ? '4g' : '4g',
              downlink: isMobile ? 10 : 100,
              rtt: isMobile ? 50 : 25,
              saveData: false
            };
            try {
              if (navigator.connection) {
                Object.defineProperty(navigator.connection, 'effectiveType', { get: () => fakeConn.effectiveType, configurable: true });
                Object.defineProperty(navigator.connection, 'downlink', { get: () => fakeConn.downlink, configurable: true });
                Object.defineProperty(navigator.connection, 'rtt', { get: () => fakeConn.rtt, configurable: true });
                Object.defineProperty(navigator.connection, 'saveData', { get: () => fakeConn.saveData, configurable: true });
              }
            } catch(e) {}
          }
          
          // --- 11. Battery API protection ---
          if ('getBattery' in Navigator.prototype) {
            if (isMobile || isTablet) {
              // Return a realistic battery object for mobile
              Navigator.prototype.getBattery = function() {
                return Promise.resolve({
                  charging: true,
                  chargingTime: Infinity,
                  dischargingTime: Infinity,
                  level: 0.85 + Math.random() * 0.12,
                  addEventListener: function() {},
                  removeEventListener: function() {},
                  dispatchEvent: function() { return true; },
                  onchargingchange: null,
                  onchargingtimechange: null,
                  ondischargingtimechange: null,
                  onlevelchange: null
                });
              };
            } else {
              // Desktop: hide battery API entirely (many desktops don't expose it)
              delete Navigator.prototype.getBattery;
            }
          }
          
          // --- 12. Protect Permissions API from detection ---
          if (window.Permissions && Permissions.prototype.query) {
            const originalQuery = Permissions.prototype.query;
            Permissions.prototype.query = function(desc) {
              // Notification permission querying can be used for fingerprinting
              if (desc && desc.name === 'notifications') {
                return Promise.resolve({ state: 'prompt', onchange: null });
              }
              return originalQuery.call(this, desc);
            };
          }
          
          // --- 13. Spoof window.chrome for Chrome UA ---
          if ((isChrome || isEdge) && !window.chrome) {
            window.chrome = {
              app: { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } },
              runtime: { OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' }, OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' }, PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' }, PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' }, PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' }, RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' } },
              csi: function() {},
              loadTimes: function() { return {}; }
            };
          } else if (isFirefox && window.chrome) {
            // Remove window.chrome if spoofing as Firefox
            try { delete window.chrome; } catch(e) { window.chrome = undefined; }
          }
          
          // --- 14. Override toString to hide modifications ---
          const nativeToString = Function.prototype.toString;
          const spoofedFunctions = new Set();
          
          const markAsSpoofed = (fn, original) => {
            spoofedFunctions.add(fn);
            return fn;
          };
          
          // Make overridden functions return native-looking toString
          Function.prototype.toString = function() {
            if (spoofedFunctions.has(this)) {
              return 'function ' + (this.name || '') + '() { [native code] }';
            }
            return nativeToString.call(this);
          };
          spoofedFunctions.add(Function.prototype.toString);
          
          // Mark key spoofed getters
          try {
            const navigatorDesc = Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver');
            if (navigatorDesc && navigatorDesc.get) spoofedFunctions.add(navigatorDesc.get);
          } catch(e) {}
          
          console.log('[MorphAgent] Detection protection active');
        } catch (e) {
          console.warn('[MorphAgent] Failed to inject detection protection:', e);
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }
})(); 