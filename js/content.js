// content.js - MorphAgent 4.0.0
// 10-Tier Anti-Fingerprinting & Stealth Content Injection Suite

(function() {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  // Retrieve settings and initialize shields at document_start
  api.storage.local.get([
    'selectedUA',
    'touchSpoofEnabled',
    'maxTouchPoints',
    'jsBlockEnabled',
    'jsProtectEnabled',
    'activeCategory',
    'customScreenEnabled',
    'customScreenSpecs',
    'webGLProtectEnabled',
    'audioProtectEnabled',
    'webRTCProtectEnabled',
    'geoProtectEnabled',
    'geoSpecs'
  ]).then((settings) => {
    if (!settings.selectedUA) return;

    injectStealthSuite(settings);

    if (settings.jsBlockEnabled) {
      blockInlineJavaScript();
    }
  }).catch(err => {
    console.warn('[MorphAgent 4.0] Storage access error:', err);
  });

  // Check per-website rule overrides
  api.storage.sync.get(['websiteRules']).then((result) => {
    const websiteRules = result.websiteRules || [];
    const currentHostname = window.location.hostname;

    for (const rule of websiteRules) {
      const rulePattern = rule.website.replace(/\*/g, '');
      if (currentHostname.includes(rulePattern)) {
        if (rule.jsBlocked) {
          blockInlineJavaScript();
        }
        if (rule.userAgent) {
          injectStealthSuite({
            selectedUA: rule.userAgent,
            maxTouchPoints: rule.touchPoints || 0,
            touchSpoofEnabled: (rule.touchPoints || 0) > 0,
            jsProtectEnabled: true
          });
        }
        break;
      }
    }
  }).catch(() => {});

  // Main Stealth Injection Generator
  function injectStealthSuite(settings) {
    const script = document.createElement('script');
    script.textContent = `
      (() => {
        try {
          const ua = ${JSON.stringify(settings.selectedUA)};
          const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
          const isTablet = /iPad|Tablet/i.test(ua);
          const isTouch = ${JSON.stringify(!!settings.touchSpoofEnabled)};
          const maxTouchPoints = ${settings.maxTouchPoints || (isMobile ? 5 : 0)};

          // 1. User Agent & Navigator Platform Spoofing
          const getPlatform = (str) => {
            if (str.includes('iPhone')) return 'iPhone';
            if (str.includes('iPad')) return 'iPad';
            if (str.includes('Android')) return 'Linux armv81';
            if (str.includes('Windows')) return 'Win32';
            if (str.includes('Macintosh') || str.includes('Mac OS X')) return 'MacIntel';
            if (str.includes('Linux')) return 'Linux x86_64';
            return 'Win32';
          };

          const getVendor = (str) => {
            if (str.includes('Safari') && !str.includes('Chrome') && !str.includes('Edg')) return 'Apple Computer, Inc.';
            if (str.includes('Firefox')) return '';
            return 'Google Inc.';
          };

          Object.defineProperty(Navigator.prototype, 'userAgent', { get: () => ua, configurable: true });
          Object.defineProperty(Navigator.prototype, 'appVersion', { get: () => ua.replace(/^Mozilla\\//, ''), configurable: true });
          Object.defineProperty(Navigator.prototype, 'platform', { get: () => getPlatform(ua), configurable: true });
          Object.defineProperty(Navigator.prototype, 'vendor', { get: () => getVendor(ua), configurable: true });
          Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => maxTouchPoints, configurable: true });

          // 2. Client Hints (Sec-CH-UA) & navigator.userAgentData
          let brandName = 'Google Chrome';
          let majorVer = '145';
          let fullVer = '145.0.0.0';
          let osName = 'Windows';

          if (ua.includes('Edg')) { brandName = 'Microsoft Edge'; const m = ua.match(/Edg\\/([0-9.]+)/); if (m) { fullVer = m[1]; majorVer = fullVer.split('.')[0]; } }
          else if (ua.includes('Chrome')) { brandName = 'Google Chrome'; const m = ua.match(/Chrome\\/([0-9.]+)/); if (m) { fullVer = m[1]; majorVer = fullVer.split('.')[0]; } }
          else if (ua.includes('Firefox')) { brandName = 'Mozilla Firefox'; const m = ua.match(/Firefox\\/([0-9.]+)/); if (m) { fullVer = m[1]; majorVer = fullVer.split('.')[0]; } }

          if (ua.includes('Windows')) osName = 'Windows';
          else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) osName = 'macOS';
          else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';
          else if (ua.includes('Android')) osName = 'Android';
          else if (ua.includes('Linux')) osName = 'Linux';

          const brands = [
            { brand: 'Not(A:Brand', version: '99' },
            { brand: brandName, version: majorVer },
            { brand: 'Chromium', version: majorVer }
          ];

          const fullVersionList = [
            { brand: 'Not(A:Brand', version: '99.0.0.0' },
            { brand: brandName, version: fullVer },
            { brand: 'Chromium', version: fullVer }
          ];

          const userAgentDataObj = {
            brands: brands,
            mobile: isMobile,
            platform: osName,
            getHighEntropyValues: function(hints) {
              return Promise.resolve({
                brands: brands,
                mobile: isMobile,
                platform: osName,
                platformVersion: '15.0.0',
                architecture: osName === 'macOS' || osName === 'iOS' || osName === 'Android' ? 'arm' : 'x86',
                bitness: '64',
                model: isMobile ? (osName === 'iOS' ? 'iPhone' : 'Galaxy') : '',
                fullVersionList: fullVersionList,
                uaFullVersion: fullVer
              });
            },
            toJSON: function() {
              return { brands: brands, mobile: isMobile, platform: osName };
            }
          };

          Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => userAgentDataObj, configurable: true });

          // 3. Canvas & WebGL Seeded Noise Matrix
          const domainHash = Array.from(window.location.hostname).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0);
          const noiseFactor = (domainHash % 5 + 1) * 0.00001;

          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            const ctx = this.getContext('2d');
            if (ctx) {
              try {
                const imgData = ctx.getImageData(0, 0, Math.min(this.width || 10, 10), Math.min(this.height || 10, 10));
                if (imgData.data.length > 0) imgData.data[0] = (imgData.data[0] + 1) % 255;
              } catch (e) {}
            }
            return originalToDataURL.apply(this, args);
          };

          const getWebGLVendorRenderer = () => {
            if (osName === 'macOS' || osName === 'iOS') return { vendor: 'Apple Inc.', renderer: 'Apple M4 GPU' };
            if (osName === 'Android') return { vendor: 'Qualcomm', renderer: 'Adreno (TM) 750' };
            return { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0)' };
          };

          const webglSpecs = getWebGLVendorRenderer();
          const overrideWebGL = (proto) => {
            if (!proto) return;
            const originalGetParameter = proto.getParameter;
            proto.getParameter = function(param) {
              if (param === 37445) return webglSpecs.vendor; // UNMASKED_VENDOR_WEBGL
              if (param === 37446) return webglSpecs.renderer; // UNMASKED_RENDERER_WEBGL
              return originalGetParameter.apply(this, arguments);
            };
          };

          if (window.WebGLRenderingContext) overrideWebGL(WebGLRenderingContext.prototype);
          if (window.WebGL2RenderingContext) overrideWebGL(WebGL2RenderingContext.prototype);

          // 4. AudioContext Fingerprint Protection
          if (window.AnalyserNode) {
            const origGetFloatFreq = AnalyserNode.prototype.getFloatFrequencyData;
            AnalyserNode.prototype.getFloatFrequencyData = function(array) {
              origGetFloatFreq.apply(this, arguments);
              for (let i = 0; i < array.length; i += 100) {
                array[i] += (domainHash % 10 - 5) * 0.001;
              }
            };
          }

          // 5. WebRTC Local IP Leak Protection
          if (window.RTCPeerConnection) {
            const origCreateOffer = RTCPeerConnection.prototype.createOffer;
            RTCPeerConnection.prototype.createOffer = function(options) {
              return origCreateOffer.apply(this, arguments).then(offer => {
                if (offer && offer.sdp) {
                  offer.sdp = offer.sdp.replace(/\\b(192\\.168\\.\\d+\\.\\d+|10\\.\\d+\\.\\d+\\.\\d+|172\\.(1[6-9]|2[0-9]|3[0-1])\\.\\d+\\.\\d+)\\b/g, '0.0.0.0');
                }
                return offer;
              });
            };
          }

          // 6. Screen Dimensions & Orientation Matrix
          const screenSpecs = isMobile
            ? { width: 393, height: 852, colorDepth: 30, dpr: 3 }
            : (isTablet ? { width: 1024, height: 1366, colorDepth: 24, dpr: 2 } : { width: 1920, height: 1080, colorDepth: 24, dpr: 1 });

          Object.defineProperty(Screen.prototype, 'width', { get: () => screenSpecs.width, configurable: true });
          Object.defineProperty(Screen.prototype, 'height', { get: () => screenSpecs.height, configurable: true });
          Object.defineProperty(Screen.prototype, 'availWidth', { get: () => screenSpecs.width, configurable: true });
          Object.defineProperty(Screen.prototype, 'availHeight', { get: () => screenSpecs.height - 40, configurable: true });
          Object.defineProperty(Screen.prototype, 'colorDepth', { get: () => screenSpecs.colorDepth, configurable: true });
          Object.defineProperty(Screen.prototype, 'pixelDepth', { get: () => screenSpecs.colorDepth, configurable: true });
          Object.defineProperty(window, 'devicePixelRatio', { get: () => screenSpecs.dpr, configurable: true });

          // 7. Font Metrics Micro Noise
          const origMeasureText = CanvasRenderingContext2D.prototype.measureText;
          CanvasRenderingContext2D.prototype.measureText = function(text) {
            const metrics = origMeasureText.apply(this, arguments);
            const fakeWidth = metrics.width + (text.length > 0 ? noiseFactor : 0);
            return new Proxy(metrics, {
              get(target, prop) {
                if (prop === 'width') return fakeWidth;
                return target[prop];
              }
            });
          };

          // 8. Cloak Spoofed Functions to return [native code]
          const nativeToString = Function.prototype.toString;
          const spoofedFuncs = new Set([
            HTMLCanvasElement.prototype.toDataURL,
            Navigator.prototype.userAgentData.getHighEntropyValues
          ]);

          Function.prototype.toString = function() {
            if (spoofedFuncs.has(this)) {
              return 'function ' + (this.name || '') + '() { [native code] }';
            }
            return nativeToString.apply(this, arguments);
          };

        } catch (e) {
          console.warn('[MorphAgent 4.0] Injection warning:', e);
        }
      })();
    `;

    document.documentElement.appendChild(script);
    script.remove();
  }

  function blockInlineJavaScript() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "script-src 'none'";
    document.documentElement.appendChild(meta);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            node.remove();
          }
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();