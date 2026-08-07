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

      // Hardware Stealth Protections
      if (s.jsProtectEnabled) {
        const domainHash = Array.from(window.location.hostname).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0);

        if (!window.__MORPH_CANVAS_PROTECTED) {
          window.__MORPH_CANVAS_PROTECTED = true;
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

        if (!window.__MORPH_RTC_PROTECTED && window.RTCPeerConnection) {
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
