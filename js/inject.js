(function() {
  if (window.__MORPH_INJECTED__) return;
  window.__MORPH_INJECTED__ = true;

  try {
    let cachedSettings = null;
    let isSettingsLoaded = false;
    const pendingCalls = [];
    const pendingWatches = [];

    // Attempt to load synchronous settings
    try {
      const raw = sessionStorage.getItem('morph_agent_settings') || localStorage.getItem('morph_agent_settings');
      if (raw) {
        cachedSettings = JSON.parse(raw);
        isSettingsLoaded = true;
      }
    } catch (e) {}

    window.__MORPH_AGENT_SETTINGS__ = cachedSettings || window.__MORPH_AGENT_SETTINGS__ || {};

    function applyStealthSettings(s) {
      if (!s) return;
      const uaSpoofEnabled = s.uaSpoofEnabled !== false;
      const ua = s.selectedUA || '';
      const isMobile = ua ? /Android|iPhone|iPad|iPod|Mobile/i.test(ua) : false;

      // User Agent & Navigator Platform Spoofing
      if (uaSpoofEnabled && ua) {
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
        Object.defineProperty(Navigator.prototype, 'appVersion', { get: () => ua.replace(/^Mozilla\//, ''), configurable: true });
        Object.defineProperty(Navigator.prototype, 'platform', { get: () => getPlatform(ua), configurable: true });
        Object.defineProperty(Navigator.prototype, 'vendor', { get: () => getVendor(ua), configurable: true });

        let brandName = 'Google Chrome';
        let majorVer = '145';
        let fullVer = '145.0.0.0';
        let osName = 'Windows';

        if (ua.includes('Edg')) { brandName = 'Microsoft Edge'; const m = ua.match(/Edg\/([0-9.]+)/); if (m) { fullVer = m[1]; majorVer = fullVer.split('.')[0]; } }
        else if (ua.includes('Chrome')) { brandName = 'Google Chrome'; const m = ua.match(/Chrome\/([0-9.]+)/); if (m) { fullVer = m[1]; majorVer = fullVer.split('.')[0]; } }
        else if (ua.includes('Firefox')) { brandName = 'Mozilla Firefox'; const m = ua.match(/Firefox\/([0-9.]+)/); if (m) { fullVer = m[1]; majorVer = fullVer.split('.')[0]; } }

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
      }

      // Touch Spoofing
      if (s.touchSpoofEnabled) {
        const maxTouchPoints = s.maxTouchPoints || (s.selectedUA && /Android|iPhone|iPad/i.test(s.selectedUA) ? 5 : 0);
        Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => maxTouchPoints, configurable: true });
      }

      // Hardware & Screen Stealth Protections
      if (s.jsProtectEnabled) {
        const domainHash = Array.from(window.location.hostname).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0);

        // Spoof Hardware Details
        Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => 8, configurable: true });
        Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: () => 8, configurable: true });

        // Spoof Screen Metrics
        if (window.Screen) {
          Object.defineProperty(Screen.prototype, 'width', { get: () => 1920, configurable: true });
          Object.defineProperty(Screen.prototype, 'height', { get: () => 1080, configurable: true });
          Object.defineProperty(Screen.prototype, 'colorDepth', { get: () => 24, configurable: true });
          Object.defineProperty(Screen.prototype, 'pixelDepth', { get: () => 24, configurable: true });
        }
        Object.defineProperty(window, 'innerWidth', { get: () => 1920, configurable: true });
        Object.defineProperty(window, 'innerHeight', { get: () => 1080, configurable: true });

        // Spoof Media Devices (Webcams/Mics)
        if (window.MediaDevices && MediaDevices.prototype.enumerateDevices) {
          MediaDevices.prototype.enumerateDevices = function() {
            return Promise.resolve([
              { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone', groupId: 'default' },
              { deviceId: 'default', kind: 'videoinput', label: 'Default Webcam', groupId: 'default' },
              { deviceId: 'default', kind: 'audiooutput', label: 'Default Speaker', groupId: 'default' }
            ]);
          };
        }

        // DRM (Encrypted Media Extensions) Spoofing
        if (window.Navigator && Navigator.prototype.requestMediaKeySystemAccess) {
          const originalRequestMediaKeySystemAccess = Navigator.prototype.requestMediaKeySystemAccess;
          Navigator.prototype.requestMediaKeySystemAccess = function(keySystem, supportedConfigurations) {
            // Block proprietary DRMs to prevent OS identification, allow Widevine
            if (keySystem === 'com.microsoft.playready' || keySystem === 'com.apple.fps.1_0') {
              return Promise.reject(new DOMException('Unsupported keySystem', 'NotSupportedError'));
            }
            return originalRequestMediaKeySystemAccess.call(this, keySystem, supportedConfigurations);
          };
        }

        if (!window.__MORPH_CANVAS_PROTECTED) {
          window.__MORPH_CANVAS_PROTECTED = true;
          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            const ctx = this.getContext('2d');
            if (ctx) {
              try {
                const imgData = ctx.getImageData(0, 0, Math.min(this.width || 10, 10), Math.min(this.height || 10, 10));
                if (imgData.data.length > 0) imgData.data[0] = (imgData.data[0] + (domainHash % 3) + 1) % 255;
              } catch (e) {}
            }
            return originalToDataURL.apply(this, args);
          };

          if (window.CanvasRenderingContext2D) {
            const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = function(...args) {
              const imageData = originalGetImageData.apply(this, args);
              // Inject microscopic, domain-specific noise (e.g. modify every 17th pixel slightly)
              for (let i = 0; i < imageData.data.length; i += (17 * 4)) {
                imageData.data[i] = (imageData.data[i] + (domainHash % 3)) % 255;
              }
              return imageData;
            };
          }
        }

        if (!window.__MORPH_AUDIO_PROTECTED && window.AnalyserNode) {
          window.__MORPH_AUDIO_PROTECTED = true;
          const origGetFloatFreq = AnalyserNode.prototype.getFloatFrequencyData;
          AnalyserNode.prototype.getFloatFrequencyData = function(array) {
            origGetFloatFreq.apply(this, arguments);
            for (let i = 0; i < array.length; i += 100) {
              array[i] += (domainHash % 10 - 5) * 0.001;
            }
          };
        }

        if (!window.__MORPH_RTC_PROTECTED && window.RTCPeerConnection && s.rtcProtectEnabled !== false) {
          window.__MORPH_RTC_PROTECTED = true;
          const origCreateOffer = RTCPeerConnection.prototype.createOffer;
          RTCPeerConnection.prototype.createOffer = function(options) {
            return origCreateOffer.apply(this, arguments).then(offer => {
              if (offer && offer.sdp) {
                offer.sdp = offer.sdp.replace(/\b(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)\b/g, '0.0.0.0');
              }
              return offer;
            });
          };
        }

        if (!window.__MORPH_NETWORK_PROTECTED && window.navigator && s.rtcProtectEnabled !== false) {
          window.__MORPH_NETWORK_PROTECTED = true;
          if (navigator.connection) {
            const fakeConn = {
              downlink: isMobile ? 2.5 : 10,
              effectiveType: '4g',
              rtt: isMobile ? 100 : 50,
              saveData: false,
              type: isMobile ? 'cellular' : 'wifi',
              onchange: null
            };
            Object.defineProperty(navigator, 'connection', { get: () => fakeConn, configurable: true });
          }
        }

        // Offline AudioContext Spoofing
        if (window.OfflineAudioContext) {
          const originalGetChannelData = AudioBuffer.prototype.getChannelData;
          AudioBuffer.prototype.getChannelData = function() {
            const results = originalGetChannelData.apply(this, arguments);
            for (let i = 0; i < results.length; i += 100) {
              results[i] = results[i] + ((domainHash % 10 - 5) * 0.0000001);
            }
            return results;
          };
        }

        // WebGL Spoofing
        if (!window.__MORPH_WEBGL_PROTECTED && window.WebGLRenderingContext) {
          window.__MORPH_WEBGL_PROTECTED = true;
          const spoofWebGL = (ctxProto) => {
            if (!ctxProto) return;
            const originalGetParameter = ctxProto.getParameter;
            const originalReadPixels = ctxProto.readPixels;
            
            ctxProto.getParameter = function(parameter) {
              if (parameter === 37445) return 'Google Inc. (Intel)';
              if (parameter === 37446) return 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)';
              return originalGetParameter.apply(this, arguments);
            };
            
            if (originalReadPixels) {
              ctxProto.readPixels = function(...args) {
                originalReadPixels.apply(this, args);
                const pixels = args[6];
                if (pixels && pixels.length > 0) {
                  pixels[0] = (pixels[0] + (domainHash % 5)) % 255;
                }
              };
            }
          };
          spoofWebGL(window.WebGLRenderingContext.prototype);
          spoofWebGL(window.WebGL2RenderingContext ? window.WebGL2RenderingContext.prototype : null);
        }

        // ClientRects Bounding Box Spoofing
        if (!window.__MORPH_CLIENTRECTS_PROTECTED && window.Element) {
          window.__MORPH_CLIENTRECTS_PROTECTED = true;
          const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
          const applyNoiseToRect = (rect) => {
            if (!rect) return rect;
            const noise = (domainHash % 100) * 0.0001;
            const modified = {
              x: rect.x + noise, y: rect.y + noise,
              width: rect.width + noise, height: rect.height + noise,
              top: rect.top + noise, right: rect.right + noise,
              bottom: rect.bottom + noise, left: rect.left + noise,
              toJSON: rect.toJSON
            };
            Object.setPrototypeOf(modified, DOMRect.prototype);
            return modified;
          };
          Element.prototype.getBoundingClientRect = function() {
            return applyNoiseToRect(origGetBoundingClientRect.apply(this, arguments));
          };
        }

        // Font Enumeration Defender
        if (!window.__MORPH_FONT_PROTECTED && window.HTMLElement) {
          window.__MORPH_FONT_PROTECTED = true;
          const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
          const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
          if (origOffsetWidth && origOffsetHeight) {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
              get: function() {
                const val = origOffsetWidth.get.call(this);
                return val + (domainHash % 3 === 0 && val > 10 ? 1 : 0);
              }, configurable: true
            });
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
              get: function() {
                const val = origOffsetHeight.get.call(this);
                return val + (domainHash % 2 === 0 && val > 10 ? 1 : 0);
              }, configurable: true
            });
          }
        }

        // Behavioral Biometric Masking
        if (!window.__MORPH_BEHAVIOR_PROTECTED && window.MouseEvent) {
          window.__MORPH_BEHAVIOR_PROTECTED = true;
          const origClientX = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'clientX');
          const origClientY = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'clientY');
          if (origClientX && origClientY) {
            Object.defineProperty(MouseEvent.prototype, 'clientX', {
              get: function() {
                const val = origClientX.get.call(this);
                return this.isTrusted ? val + (domainHash % 3) : val;
              }, configurable: true
            });
            Object.defineProperty(MouseEvent.prototype, 'clientY', {
              get: function() {
                const val = origClientY.get.call(this);
                return this.isTrusted ? val + (domainHash % 3) : val;
              }, configurable: true
            });
          }
        }

        // Battery API Spoofing
        if (!window.__MORPH_BATTERY_PROTECTED && window.navigator && window.navigator.getBattery) {
          window.__MORPH_BATTERY_PROTECTED = true;
          window.navigator.getBattery = function() {
            return Promise.resolve({
              charging: false,
              chargingTime: Infinity,
              dischargingTime: 86400,
              level: 0.85 - ((domainHash % 10) * 0.01),
              onchargingchange: null,
              onchargingtimechange: null,
              ondischargingtimechange: null,
              onlevelchange: null
            });
          };
        }
      }

      // Timezone Spoofing (tied to Location Spoofing)
      if (s.geoSpoofEnabled && !window.__MORPH_TZ_PROTECTED) {
        window.__MORPH_TZ_PROTECTED = true;
        Date.prototype.getTimezoneOffset = function() { return 0; };
        if (window.Intl && Intl.DateTimeFormat) {
          const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
          Intl.DateTimeFormat.prototype.resolvedOptions = function() {
            const options = originalResolvedOptions.apply(this, arguments);
            options.timeZone = 'UTC';
            return options;
          };
        }
      }
    }

    // Apply cached settings synchronously before any page scripts run
    applyStealthSettings(cachedSettings);

    window.addEventListener('morph-agent-update', (evt) => {
      let data = null;
      if (typeof evt.detail === 'string') {
        try { data = JSON.parse(evt.detail); } catch(e) {}
      } else if (evt.detail && typeof evt.detail === 'object' && Object.keys(evt.detail).length > 0) {
        data = evt.detail;
      }
      
      if (!data) {
        try {
          const raw = sessionStorage.getItem('morph_agent_settings') || localStorage.getItem('morph_agent_settings');
          if (raw) data = JSON.parse(raw);
        } catch(e) {}
      }

      if (data) {
        window.__MORPH_AGENT_SETTINGS__ = data;
        isSettingsLoaded = true;
        try {
          sessionStorage.setItem('morph_agent_settings', JSON.stringify(data));
          localStorage.setItem('morph_agent_settings', JSON.stringify(data));
        } catch (e) {}
        
        applyStealthSettings(data);
        
        while (pendingCalls.length > 0) pendingCalls.shift()();
        while (pendingWatches.length > 0) pendingWatches.shift()();
      }
    });

    // Synchronous Geolocation & Permissions Engine
    if (typeof Geolocation !== 'undefined' && Geolocation.prototype) {
      function getMockPos() {
        const s = window.__MORPH_AGENT_SETTINGS__ || {};
        const coords = s.geoCoords || { lat: 40.7128, lng: -74.0060 };
        const lat = parseFloat(coords.lat) || 40.7128;
        const lng = parseFloat(coords.lng) || -74.0060;
        
        const pos = {
          coords: {
            latitude: lat,
            longitude: lng,
            altitude: null,
            accuracy: 20.0,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        };
        
        try {
          if (typeof GeolocationPosition !== 'undefined') {
            Object.setPrototypeOf(pos, GeolocationPosition.prototype);
          }
          if (typeof GeolocationCoordinates !== 'undefined') {
            Object.setPrototypeOf(pos.coords, GeolocationCoordinates.prototype);
          }
        } catch (e) {}
        
        return pos;
      }

      Geolocation.prototype.getCurrentPosition = new Proxy(Geolocation.prototype.getCurrentPosition, {
        apply(target, thisArg, args) {
          const success = args[0];
          const error = args[1];
          const options = args[2];
          
          const run = () => {
            const s = window.__MORPH_AGENT_SETTINGS__ || {};
            if (s.geoSpoofEnabled) {
              if (typeof success === 'function') {
                setTimeout(() => success(getMockPos()), 0);
              }
            } else {
              Reflect.apply(target, thisArg, args);
            }
          };

          if (isSettingsLoaded) {
            run();
          } else {
            pendingCalls.push(run);
            setTimeout(() => {
              const index = pendingCalls.indexOf(run);
              if (index > -1) {
                pendingCalls.splice(index, 1);
                Reflect.apply(target, thisArg, args);
              }
            }, 1000);
          }
        }
      });

      const activeWatches = new Map();
      let watchCounter = 1;

      Geolocation.prototype.watchPosition = new Proxy(Geolocation.prototype.watchPosition, {
        apply(target, thisArg, args) {
          const success = args[0];
          const error = args[1];
          const options = args[2];
          const id = watchCounter++;
          
          const run = () => {
            const s = window.__MORPH_AGENT_SETTINGS__ || {};
            if (s.geoSpoofEnabled) {
              if (typeof success === 'function') {
                setTimeout(() => success(getMockPos()), 0);
                const interval = setInterval(() => {
                  success(getMockPos());
                }, 1000);
                activeWatches.set(id, interval);
              }
            } else {
              const realId = Reflect.apply(target, thisArg, args);
              activeWatches.set(id, realId);
            }
          };

          if (isSettingsLoaded) {
            run();
          } else {
            pendingWatches.push(run);
            setTimeout(() => {
              const index = pendingWatches.indexOf(run);
              if (index > -1) {
                pendingWatches.splice(index, 1);
                const realId = Reflect.apply(target, thisArg, args);
                activeWatches.set(id, realId);
              }
            }, 1000);
          }
          return id;
        }
      });

      Geolocation.prototype.clearWatch = new Proxy(Geolocation.prototype.clearWatch, {
        apply(target, thisArg, args) {
          const id = args[0];
          if (activeWatches.has(id)) {
            const val = activeWatches.get(id);
            if (typeof val === 'number') {
              clearInterval(val);
              Reflect.apply(target, thisArg, [val]);
            }
            activeWatches.delete(id);
            return;
          }
          return Reflect.apply(target, thisArg, args);
        }
      });
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query = new Proxy(navigator.permissions.query, {
        apply(target, thisArg, args) {
          const param = args[0];
          const run = () => {
            const s = window.__MORPH_AGENT_SETTINGS__ || {};
            if (s.geoSpoofEnabled && param && param.name === 'geolocation') {
              return Promise.resolve({
                state: 'granted',
                name: 'geolocation',
                onchange: null,
                addEventListener: function() {},
                removeEventListener: function() {},
                dispatchEvent: function() { return true; }
              });
            }
            return Reflect.apply(target, thisArg, args);
          };
          
          if (isSettingsLoaded) {
            return run();
          } else {
            return new Promise((resolve, reject) => {
              const task = () => resolve(run());
              pendingCalls.push(task);
              setTimeout(() => {
                const index = pendingCalls.indexOf(task);
                if (index > -1) {
                  pendingCalls.splice(index, 1);
                  resolve(Reflect.apply(target, thisArg, args));
                }
              }, 1000);
            });
          }
        }
      });
    }
    
    // Function Cloaking
    const nativeToString = Function.prototype.toString;
    const spoofedFuncs = new Set();
    if (HTMLCanvasElement.prototype.toDataURL) spoofedFuncs.add(HTMLCanvasElement.prototype.toDataURL);
    if (typeof Geolocation !== 'undefined' && Geolocation.prototype.getCurrentPosition) spoofedFuncs.add(Geolocation.prototype.getCurrentPosition);

    Function.prototype.toString = function() {
      if (spoofedFuncs.has(this)) {
        return 'function ' + (this.name || '') + '() { [native code] }';
      }
      return nativeToString.apply(this, arguments);
    };
  } catch (e) {}
})();
