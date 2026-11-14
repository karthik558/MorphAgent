(function () {
  if (window.__MORPH_INJECTED__) return;
  window.__MORPH_INJECTED__ = true;

  try {
    let isSettingsLoaded = false;
    const pendingCalls = [];
    const pendingWatches = [];

    // Wait for extension-owned preferences. Page storage may be stale or modified by the site.
    window.__MORPH_SYNC_LOADED = isSettingsLoaded;
    window.__MORPH_AGENT_SETTINGS__ = {};

    function applyStealthSettings(s) {
      if (!s) return;
      if (window.location.hostname && (window.location.hostname === 'proxyium.com' || window.location.hostname.endsWith('.proxyium.com'))) {
        s.touchSpoofEnabled = false;
        s.geoSpoofEnabled = false;
      }
      const uaSpoofEnabled = s.uaSpoofEnabled !== false;
      const ua = s.selectedUA || '';
      const isMobile = ua ? /Android|iPhone|iPad|iPod|Mobile/i.test(ua) : false;

      // Tracking Protection: Global Privacy Control & Do Not Track Signals
      if (s.sendDntGpcEnabled !== false) {
        try {
          if (!('globalPrivacyControl' in navigator)) {
            Object.defineProperty(navigator, 'globalPrivacyControl', {
              value: true,
              configurable: true,
              enumerable: true
            });
          }
          Object.defineProperty(navigator, 'doNotTrack', {
            value: '1',
            configurable: true,
            enumerable: true
          });
          Object.defineProperty(window, 'doNotTrack', {
            value: '1',
            configurable: true,
            enumerable: true
          });
        } catch (e) { }
      }

      // Tracking Protection: Hide Search Query in document.referrer
      if (s.hideSearchQueriesEnabled !== false) {
        try {
          const ref = document.referrer;
          if (ref && (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('yandex.') || ref.includes('duckduckgo.'))) {
            const refUrl = new URL(ref);
            const sanitizedReferrer = `${refUrl.protocol}//${refUrl.hostname}/`;
            Object.defineProperty(document, 'referrer', {
              get: () => sanitizedReferrer,
              configurable: true
            });
          }
        } catch (e) { }
      }

      // Tracking Protection: Clean URL tracking parameters from page address bar
      if (s.removeTrackingParamsEnabled !== false) {
        try {
          const cleanTrackingParams = () => {
            const url = new URL(window.location.href);
            const trackingParams = [
              'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
              'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'mc_eid', 'yclid',
              '_hsenc', '_openstat', 'igshid', 'dclid', 'twclid',
              'wickedid', 'sc_clid', 'matomo_campaign', 'pk_campaign', 'gad_source'
            ];
            let changed = false;
            trackingParams.forEach(p => {
              if (url.searchParams.has(p)) {
                url.searchParams.delete(p);
                changed = true;
              }
            });
            if (changed) {
              window.history.replaceState(window.history.state, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash);
            }
          };
          cleanTrackingParams();
          const origPushState = history.pushState;
          if (origPushState && !window.__MORPH_HISTORY_WRAPPED__) {
            window.__MORPH_HISTORY_WRAPPED__ = true;
            history.pushState = function () {
              const res = origPushState.apply(this, arguments);
              cleanTrackingParams();
              return res;
            };
          }
        } catch (e) { }
      }

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
        else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';
        else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) osName = 'macOS';
        else if (ua.includes('Android')) osName = 'Android';
        else if (ua.includes('Linux')) osName = 'Linux';

        const brands = [
          { brand: 'Chromium', version: majorVer },
          { brand: brandName, version: majorVer }
        ];

        const fullVersionList = [
          { brand: 'Chromium', version: fullVer },
          { brand: brandName, version: fullVer }
        ];

        const userAgentDataObj = {
          brands: brands,
          mobile: /Mobile/.test(ua),
          platform: osName,
          getHighEntropyValues: function (hints) {
            const values = {
              platformVersion: (ua.match(/Android ([\d.]+)/)?.[1] || ua.match(/Windows NT ([\d.]+)/)?.[1] || ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replaceAll('_','.') || ''),
              architecture: /Android|iPhone|iPad|arm|aarch/i.test(ua) ? 'arm' : 'x86',
              bitness: /Win64|x64|x86_64|aarch64/.test(ua) ? '64' : '',
              model: ua.match(/Android[^;]*;\s*([^;)]+?)(?: Build\/|\))/)?.[1] || '',
              fullVersionList, uaFullVersion:fullVer, wow64:/WOW64/.test(ua)
            };
            return Promise.resolve({brands,mobile:/Mobile/.test(ua),platform:osName,...Object.fromEntries(Array.from(hints || []).filter(k=>Object.hasOwn(values,k)).map(k=>[k,values[k]]))});
          },
          toJSON: function () {
            return { brands: brands, mobile: /Mobile/.test(ua), platform: osName };
          }
        };

        Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => /(?:Chrome|Chromium)\//.test(ua) ? userAgentDataObj : undefined, configurable: true });
      }

      // Touch Spoofing
      if (s.touchSpoofEnabled) {
        const maxTouchPoints = s.maxTouchPoints ?? (s.selectedUA && /Android|iPhone|iPad/i.test(s.selectedUA) ? 5 : 0);
        Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => maxTouchPoints, configurable: true });
      }

      // Threat Telemetry Emitter with rich vector details
      const emitThreat = (type, details = '') => {
        try {
          const actionMap = {
            'Canvas DataURL': 'Cryptographic sub-pixel noise injected into toDataURL()',
            'Canvas Pixel Read': 'Noise matrix applied to getImageData() / toBlob()',
            'WebGL Parameter': 'Masked UNMASKED_RENDERER_WEBGL & Vendor strings',
            'WebGL Pixel Read': 'Pixel readback buffer scrambled with noise',
            'Audio Analyser': 'Frequency micro-jitter applied to AnalyserNode',
            'Battery API': 'Static 85% discharging level returned',
            'Timing (performance.now)': 'Spectre-mitigating micro-jitter added',
            'Clipboard Read': 'Silent rejection (NotAllowedError returned)',
            'DRM Access': 'Proprietary KeySystems blocked to conceal OS',
            'ClientRects': 'Sub-pixel bounding box layout jitter added'
          };
          window.dispatchEvent(new CustomEvent('morph-threat-detected', {
            detail: {
              type,
              domain: window.location.hostname || 'localhost',
              actionTaken: actionMap[type] || 'Protected by MorphAgent Stealth Matrix',
              details: details || '',
              timestamp: Date.now()
            }
          }));
        } catch (e) { }
      };

      // CSS Media Query Spoofing
      if (s.mediaQuerySpoofEnabled && window.matchMedia) {
        const origMatchMedia = window.matchMedia;
        window.matchMedia = function (query) {
          if (typeof query === 'string' && query.includes('prefers-color-scheme')) {
            return {
              matches: query.includes('dark') ? false : true, // Force light mode default or whatever spoof
              media: query,
              onchange: null,
              addListener: function () { },
              removeListener: function () { },
              addEventListener: function () { },
              removeEventListener: function () { },
              dispatchEvent: function () { return true; }
            };
          }
          return origMatchMedia.apply(this, arguments);
        };
      }

      if (s.hardwareHarmonizeEnabled !== false && uaSpoofEnabled && ua) {
        // Hardware & Memory Harmonization Engine
        let cores = s.hardwareConcurrency;
        let memory = s.deviceMemory;

        if (!cores) {
          if (ua.includes('iPhone') || ua.includes('iPad')) {
            cores = 6; // Apple Silicon mobile A/M chip
            memory = 8;
          } else if (ua.includes('Android')) {
            cores = 8; // Modern Octa-core Android
            memory = 8;
          } else if (ua.includes('PlayStation') || ua.includes('Xbox')) {
            cores = 8;
            memory = 16;
          } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
            cores = 8; // Apple Silicon M2/M3 base
            memory = 16;
          } else {
            cores = 8; // Modern Desktop PC
            memory = 16;
          }
        }

        if (s.customHardwareCores && s.customHardwareCores !== 'auto') {
          cores = Number(s.customHardwareCores) || cores;
        }
        if (s.customDeviceMemory && s.customDeviceMemory !== 'auto') {
          memory = Number(s.customDeviceMemory) || memory;
        }
        const snap = (value, steps) => steps.reduce((best, item) => Math.abs(item - value) < Math.abs(best - value) ? item : best, steps[0]);
        cores = snap(cores, [2, 4, 6, 8, 10, 12, 16, 24, 32, 64, 128]);
        memory = snap(memory, [2, 4, 8, 16, 32, 64, 128]);

        Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => cores, configurable: true });
        Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: () => memory, configurable: true });

      }

      // Hardware & Screen Stealth Protections
      if (s.jsProtectEnabled) {
        const domainHash = Array.from(window.location.hostname || "localhost").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0);

        // Precision Timing Shield (Anti-Spectre)
        if (s.timingShieldEnabled && !window.__MORPH_TIMING_PROTECTED && window.performance && performance.now) {
          window.__MORPH_TIMING_PROTECTED = true;
          const origNow = performance.now;
          let lastNow = 0;
          performance.now = function () {
            emitThreat('Timing (performance.now)');
            const now = origNow.call(this);
            const jitter = (Math.random() * 0.1) - 0.05; // +/- 0.05ms
            lastNow = Math.max(lastNow, now + jitter);
            return lastNow;
          };
        }

        // Clipboard Defender
        if (!window.__MORPH_CLIPBOARD_PROTECTED && window.navigator && navigator.clipboard) {
          window.__MORPH_CLIPBOARD_PROTECTED = true;
          if (navigator.clipboard.readText) {
            navigator.clipboard.readText = function () {
              emitThreat('Clipboard Read');
              return Promise.reject(new DOMException('Read permission denied.', 'NotAllowedError'));
            };
          }
        }

        // Navigator Plugins & MimeTypes Spoofing
        if (window.navigator) {
          const fakePlugin = {
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            name: "Chrome PDF Plugin",
            length: 1,
            0: { description: "Portable Document Format", suffixes: "pdf", type: "application/x-google-chrome-pdf" }
          };
          Object.setPrototypeOf(fakePlugin, Plugin.prototype);

          const fakePluginArray = { 0: fakePlugin, length: 1, 'Chrome PDF Plugin': fakePlugin, refresh: () => { } };
          Object.setPrototypeOf(fakePluginArray, PluginArray.prototype);

          const fakeMime = { description: "Portable Document Format", suffixes: "pdf", type: "application/pdf", enabledPlugin: fakePlugin };
          Object.setPrototypeOf(fakeMime, MimeType.prototype);

          const fakeMimeArray = { 0: fakeMime, length: 1, 'application/pdf': fakeMime };
          Object.setPrototypeOf(fakeMimeArray, MimeTypeArray.prototype);

          try {
            Object.defineProperty(Navigator.prototype, 'plugins', { get: () => fakePluginArray, configurable: true });
            Object.defineProperty(Navigator.prototype, 'mimeTypes', { get: () => fakeMimeArray, configurable: true });
          } catch (e) { }
        }

        // Spoof Screen Metrics. A matched profile replaces the default desktop size.
        const screenSpec = s.identityBundle && s.identityBundle.screen;
        const screenWidth = screenSpec && Number.isFinite(Number(screenSpec.width)) ? Number(screenSpec.width) : 1920;
        const screenHeight = screenSpec && Number.isFinite(Number(screenSpec.height)) ? Number(screenSpec.height) : 1080;
        const screenDepth = screenSpec && Number.isFinite(Number(screenSpec.colorDepth)) ? Number(screenSpec.colorDepth) : 24;
        if (window.Screen) {
          Object.defineProperty(Screen.prototype, 'width', { get: () => screenWidth, configurable: true });
          Object.defineProperty(Screen.prototype, 'height', { get: () => screenHeight, configurable: true });
          Object.defineProperty(Screen.prototype, 'colorDepth', { get: () => screenDepth, configurable: true });
          Object.defineProperty(Screen.prototype, 'pixelDepth', { get: () => screenDepth, configurable: true });
          if (screenSpec) {
            Object.defineProperty(Screen.prototype, 'availWidth', { get: () => screenWidth, configurable: true });
            Object.defineProperty(Screen.prototype, 'availHeight', { get: () => screenHeight, configurable: true });
          }
        }
        Object.defineProperty(window, 'innerWidth', { get: () => screenWidth, configurable: true });
        Object.defineProperty(window, 'innerHeight', { get: () => screenHeight, configurable: true });
        if (screenSpec && Number.isFinite(Number(screenSpec.devicePixelRatio))) {
          Object.defineProperty(window, 'devicePixelRatio', { get: () => Number(screenSpec.devicePixelRatio), configurable: true });
        }

        // Spoof Media Devices (Webcams/Mics)
        if (window.MediaDevices && MediaDevices.prototype.enumerateDevices) {
          MediaDevices.prototype.enumerateDevices = function () {
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
          Navigator.prototype.requestMediaKeySystemAccess = function (keySystem, supportedConfigurations) {
            emitThreat('DRM Access');
            // Block proprietary DRMs to prevent OS identification, allow Widevine
            if (keySystem === 'com.microsoft.playready' || keySystem === 'com.apple.fps.1_0') {
              return Promise.reject(new DOMException('Unsupported keySystem', 'NotSupportedError'));
            }

            // Suppress DRM robustness warnings from Chrome
            if (supportedConfigurations && Array.isArray(supportedConfigurations)) {
              supportedConfigurations.forEach(config => {
                if (config.videoCapabilities && Array.isArray(config.videoCapabilities)) {
                  config.videoCapabilities.forEach(cap => {
                    if (!cap.robustness) cap.robustness = 'SW_SECURE_CRYPTO';
                  });
                }
                if (config.audioCapabilities && Array.isArray(config.audioCapabilities)) {
                  config.audioCapabilities.forEach(cap => {
                    if (!cap.robustness) cap.robustness = 'SW_SECURE_CRYPTO';
                  });
                }
              });
            }

            return originalRequestMediaKeySystemAccess.call(this, keySystem, supportedConfigurations);
          };
        }

        if (!window.__MORPH_CANVAS_PROTECTED) {
          window.__MORPH_CANVAS_PROTECTED = true;

          const origGetContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, attributes) {
            if (type === '2d') {
              attributes = attributes || {};
              attributes.willReadFrequently = true; // Suppresses readback warnings
            }
            return origGetContext.call(this, type, attributes);
          };

          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function (...args) {
            emitThreat('Canvas DataURL');
            const ctx = origGetContext.call(this, '2d');
            if (ctx) {
              try {
                const w = Math.min(this.width || 10, 10);
                const h = Math.min(this.height || 10, 10);
                if (w > 0 && h > 0) {
                  const imgData = ctx.getImageData(0, 0, w, h);
                  if (imgData.data.length > 0) {
                    imgData.data[0] = (imgData.data[0] + (domainHash % 3) + 1) % 255;
                    ctx.putImageData(imgData, 0, 0); // Apply the noise so toDataURL captures it
                  }
                }
              } catch (e) { }
            }
            return originalToDataURL.apply(this, args);
          };

          if (window.CanvasRenderingContext2D) {
            const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = function (...args) {
              emitThreat('Canvas Pixel Read');
              const imageData = originalGetImageData.apply(this, args);
              // Inject microscopic, domain-specific noise (e.g. modify every 17th pixel slightly)
              if (imageData && imageData.data) {
                for (let i = 0; i < imageData.data.length; i += (17 * 4)) {
                  imageData.data[i] = (imageData.data[i] + (domainHash % 3)) % 255;
                }
              }
              return imageData;
            };
          }
        }

        if (!window.__MORPH_AUDIO_PROTECTED && window.AnalyserNode) {
          window.__MORPH_AUDIO_PROTECTED = true;
          const origGetFloatFreq = AnalyserNode.prototype.getFloatFrequencyData;
          AnalyserNode.prototype.getFloatFrequencyData = function (array) {
            emitThreat('Audio Analyser');
            origGetFloatFreq.apply(this, arguments);
            for (let i = 0; i < array.length; i += 100) {
              array[i] += (domainHash % 10 - 5) * 0.001;
            }
          };
        }

        if (!window.__MORPH_RTC_PROTECTED && window.RTCPeerConnection && s.webrtcPreventLeakEnabled !== false) {
          window.__MORPH_RTC_PROTECTED = true;
          const origCreateOffer = RTCPeerConnection.prototype.createOffer;
          RTCPeerConnection.prototype.createOffer = function (options) {
            return origCreateOffer.apply(this, arguments).then(offer => {
              if (offer && offer.sdp) {
                offer.sdp = offer.sdp.replace(/\b(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)\b/g, '0.0.0.0');
              }
              return offer;
            });
          };
        }

        if (!window.__MORPH_NETWORK_PROTECTED && window.navigator && s.webrtcPreventLeakEnabled !== false) {
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
          AudioBuffer.prototype.getChannelData = function () {
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

            const webglSpec = s.identityBundle && s.identityBundle.webgl;
            ctxProto.getParameter = function (parameter) {
              emitThreat('WebGL Parameter');
              if (parameter === 37445) return webglSpec && webglSpec.vendor ? webglSpec.vendor : 'Google Inc. (Intel)';
              if (parameter === 37446) return webglSpec && webglSpec.renderer ? webglSpec.renderer : 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)';
              return originalGetParameter.apply(this, arguments);
            };

            if (originalReadPixels) {
              ctxProto.readPixels = function (...args) {
                emitThreat('WebGL Pixel Read');
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

        if (window.OffscreenCanvasRenderingContext2D && !window.__MORPH_OFFSCREEN_PROTECTED) {
          window.__MORPH_OFFSCREEN_PROTECTED = true;
          const originalOffscreenRead = OffscreenCanvasRenderingContext2D.prototype.getImageData;
          if (originalOffscreenRead) {
            OffscreenCanvasRenderingContext2D.prototype.getImageData = function () {
              const imageData = originalOffscreenRead.apply(this, arguments);
              if (imageData && imageData.data && imageData.data.length) {
                imageData.data[0] = (imageData.data[0] + (domainHash % 3)) % 255;
              }
              return imageData;
            };
          }
        }

        if (!window.__MORPH_WEBGPU_PROTECTED && navigator.gpu && typeof navigator.gpu.requestAdapter === 'function') {
          window.__MORPH_WEBGPU_PROTECTED = true;
          const gpuInfo = (s.identityBundle && s.identityBundle.webgpu) || {
            vendor: 'intel', architecture: 'gen-9', device: '', description: 'Intel(R) UHD Graphics 630'
          };
          const originalRequestAdapter = navigator.gpu.requestAdapter.bind(navigator.gpu);
          navigator.gpu.requestAdapter = function () {
            const pending = originalRequestAdapter.apply(navigator.gpu, arguments);
            if (!pending || typeof pending.then !== 'function') return pending;
            return pending.then(adapter => {
              if (!adapter) return adapter;
              try { Object.defineProperty(adapter, 'info', { configurable: true, get: () => gpuInfo }); } catch (e) { }
              if (typeof adapter.requestAdapterInfo === 'function') adapter.requestAdapterInfo = function () { return Promise.resolve(gpuInfo); };
              return adapter;
            });
          };
        }

        if (s.identityBundle && s.identityBundle.coverWorkers && !window.__MORPH_WORKER_COVERED && window.Worker) {
          window.__MORPH_WORKER_COVERED = true;
          const nativeWorker = window.Worker;
          const prelude = `try{const s=${JSON.stringify({
            ua: s.identityBundle.ua || s.selectedUA || '',
            cores: s.identityBundle.cores || 0,
            memory: s.identityBundle.memory || 0,
            languages: s.identityBundle.languages || []
          })};const proto=self.WorkerNavigator&&WorkerNavigator.prototype;if(proto){if(s.ua){Object.defineProperty(proto,'userAgent',{get:function(){return s.ua;},configurable:true});}if(s.languages&&s.languages.length){Object.defineProperty(proto,'language',{get:function(){return s.languages[0];},configurable:true});Object.defineProperty(proto,'languages',{get:function(){return s.languages.slice();},configurable:true});}if(s.cores)Object.defineProperty(proto,'hardwareConcurrency',{get:function(){return s.cores;},configurable:true});if(s.memory)Object.defineProperty(proto,'deviceMemory',{get:function(){return s.memory;},configurable:true});}}catch(e){}\n`;
          function CoveredWorker(url, options) {
            try {
              const opts = options || {};
              if (opts.type === 'module') return new nativeWorker(url, opts);
              const absolute = new URL(String(url), document.baseURI);
              if (absolute.origin !== location.origin || absolute.protocol === 'blob:' || absolute.protocol === 'data:') return new nativeWorker(url, opts);
              const blobUrl = URL.createObjectURL(new Blob([prelude + 'importScripts(' + JSON.stringify(absolute.href) + ');\n'], { type: 'text/javascript' }));
              return new nativeWorker(blobUrl, opts);
            } catch (error) {
              return new nativeWorker(url, options);
            }
          }
          CoveredWorker.prototype = nativeWorker.prototype;
          window.Worker = CoveredWorker;
        }

        if (s.identityBundle && Array.isArray(s.identityBundle.voices) && window.SpeechSynthesis && !window.__MORPH_VOICES_PROTECTED) {
          window.__MORPH_VOICES_PROTECTED = true;
          const voices = s.identityBundle.voices;
          SpeechSynthesis.prototype.getVoices = function () { return voices; };
        }

        if (s.identityBundle && Array.isArray(s.identityBundle.keyboard) && navigator.keyboard && typeof navigator.keyboard.getLayoutMap === 'function' && !window.__MORPH_KEYBOARD_PROTECTED) {
          window.__MORPH_KEYBOARD_PROTECTED = true;
          const layout = new Map(s.identityBundle.keyboard);
          navigator.keyboard.getLayoutMap = function () { return Promise.resolve(layout); };
        }

        if (s.identityBundle && s.identityBundle.peripherals === 'none') {
          ['usb', 'hid', 'serial', 'bluetooth'].forEach(key => {
            try { Object.defineProperty(Navigator.prototype, key, { get: () => undefined, configurable: true }); } catch (e) { }
          });
        }

        // ClientRects Bounding Box Spoofing
        if (!window.__MORPH_CLIENTRECTS_PROTECTED && window.Element) {
          window.__MORPH_CLIENTRECTS_PROTECTED = true;
          const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
          let rectWarnCount = 0;
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
          Element.prototype.getBoundingClientRect = function () {
            if (rectWarnCount++ < 5) emitThreat('ClientRects'); // Throttle telemetry to avoid spam
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
              get: function () {
                const val = origOffsetWidth.get.call(this);
                return val + (domainHash % 3 === 0 && val > 10 ? 1 : 0);
              }, configurable: true
            });
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
              get: function () {
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
              get: function () {
                const val = origClientX.get.call(this);
                return this.isTrusted ? val + (domainHash % 3) : val;
              }, configurable: true
            });
            Object.defineProperty(MouseEvent.prototype, 'clientY', {
              get: function () {
                const val = origClientY.get.call(this);
                return this.isTrusted ? val + (domainHash % 3) : val;
              }, configurable: true
            });
          }
        }
      }

      // Timezone & Locale Auto-Harmonizer Engine
      if (s.geoSpoofEnabled && s.autoHarmonizeTzEnabled !== false) {
        const coords = s.geoCoords || { lat: 40.7128, lng: -74.0060 };
        const lat = Number.isFinite(Number(coords.lat)) && Math.abs(Number(coords.lat)) <= 90 ? Number(coords.lat) : 0;
        const lng = Number.isFinite(Number(coords.lng)) && Math.abs(Number(coords.lng)) <= 180 ? Number(coords.lng) : 0;

        const tzInfo = resolveTimezoneAndLocale(lat, lng, s.geoTimezone, s.geoLocale);

        const NativeDateTimeFormat = Intl.DateTimeFormat;
        Date.prototype.getTimezoneOffset = function () {
          if (!Number.isFinite(this.getTime())) return NaN;
          const parts = new NativeDateTimeFormat('en-US', {timeZone:tzInfo.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(this);
          const p=Object.fromEntries(parts.map(v=>[v.type,v.value]));
          return (Math.floor(this.getTime()/1000)*1000-Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second))/60000;
        };
        const optionsFor = options => ({...options,timeZone:options?.timeZone ?? tzInfo.timeZone});
        Intl.DateTimeFormat = new Proxy(NativeDateTimeFormat, {
          construct(target,args) {return Reflect.construct(target,[args[0],optionsFor(args[1])]);},
          apply(target,thisArg,args) {return Reflect.apply(target,thisArg,[args[0],optionsFor(args[1])]);}
        });
        for (const method of ['toLocaleString','toLocaleDateString','toLocaleTimeString']) {
          const original=Date.prototype[method];
          Date.prototype[method]=function(locales,options) {return Reflect.apply(original,this,[locales,optionsFor(options)]);};
        }

        // Harmonize navigator.languages and navigator.language
        if (tzInfo.languages && tzInfo.languages.length > 0) {
          Object.defineProperty(Navigator.prototype, 'language', { get: () => tzInfo.languages[0], configurable: true });
          Object.defineProperty(Navigator.prototype, 'languages', { get: () => tzInfo.languages, configurable: true });
        }
      }

      const geoOwnsLanguage = s.geoSpoofEnabled && s.autoHarmonizeTzEnabled !== false;
      if (!geoOwnsLanguage && s.identityBundle && Array.isArray(s.identityBundle.languages) && s.identityBundle.languages.length) {
        const profileLanguages = s.identityBundle.languages.filter(language => typeof language === 'string').slice(0, 8);
        if (profileLanguages.length) {
          Object.defineProperty(Navigator.prototype, 'language', { get: () => profileLanguages[0], configurable: true });
          Object.defineProperty(Navigator.prototype, 'languages', { get: () => profileLanguages.slice(), configurable: true });
        }
      }
    }

    // Timezone & Locale Resolver Helpers
    function resolveTimezoneAndLocale(lat, lng, explicitTz, explicitLocale) {
      if (explicitTz && explicitTz !== 'auto') {
        return {
          timeZone: explicitTz,
          offset: getTimezoneOffsetForName(explicitTz),
          locale: explicitLocale || getLocaleForTimezone(explicitTz),
          languages: getLanguagesForTimezone(explicitTz)
        };
      }

      // Geospatial lookup for major regions & cities
      // US East (NY, Boston, DC, Miami)
      if (lat >= 24 && lat <= 48 && lng >= -85 && lng <= -65) {
        return { timeZone: 'America/New_York', offset: isDSTInUS() ? 240 : 300, locale: 'en-US', languages: ['en-US', 'en'] };
      }
      // US West (LA, SF, Seattle)
      if (lat >= 30 && lat <= 50 && lng >= -125 && lng <= -115) {
        return { timeZone: 'America/Los_Angeles', offset: isDSTInUS() ? 420 : 480, locale: 'en-US', languages: ['en-US', 'en'] };
      }
      // US Central (Chicago, Dallas)
      if (lat >= 26 && lat <= 50 && lng >= -105 && lng < -85) {
        return { timeZone: 'America/Chicago', offset: isDSTInUS() ? 300 : 360, locale: 'en-US', languages: ['en-US', 'en'] };
      }
      // UK (London)
      if (lat >= 49 && lat <= 60 && lng >= -8 && lng <= 2) {
        return { timeZone: 'Europe/London', offset: isDSTInEurope() ? -60 : 0, locale: 'en-GB', languages: ['en-GB', 'en'] };
      }
      // France (Paris)
      if (lat >= 42 && lat <= 52 && lng >= -5 && lng <= 9) {
        return { timeZone: 'Europe/Paris', offset: isDSTInEurope() ? -120 : -60, locale: 'fr-FR', languages: ['fr-FR', 'fr', 'en-US'] };
      }
      // Germany (Berlin, Frankfurt)
      if (lat >= 47 && lat <= 55 && lng >= 6 && lng <= 15) {
        return { timeZone: 'Europe/Berlin', offset: isDSTInEurope() ? -120 : -60, locale: 'de-DE', languages: ['de-DE', 'de', 'en-US'] };
      }
      // Japan (Tokyo)
      if (lat >= 30 && lat <= 46 && lng >= 128 && lng <= 146) {
        return { timeZone: 'Asia/Tokyo', offset: -540, locale: 'ja-JP', languages: ['ja-JP', 'ja', 'en-US'] };
      }
      // Singapore
      if (lat >= 1 && lat <= 2 && lng >= 103 && lng <= 105) {
        return { timeZone: 'Asia/Singapore', offset: -480, locale: 'en-SG', languages: ['en-SG', 'zh-SG', 'en'] };
      }
      // Australia (Sydney)
      if (lat >= -40 && lat <= -25 && lng >= 140 && lng <= 155) {
        return { timeZone: 'Australia/Sydney', offset: isDSTInAustralia() ? -660 : -600, locale: 'en-AU', languages: ['en-AU', 'en'] };
      }
      // UAE (Dubai)
      if (lat >= 22 && lat <= 27 && lng >= 51 && lng <= 57) {
        return { timeZone: 'Asia/Dubai', offset: -240, locale: 'ar-AE', languages: ['ar-AE', 'en-US'] };
      }
      // India
      if (lat >= 8 && lat <= 36 && lng >= 68 && lng <= 90) {
        return { timeZone: 'Asia/Kolkata', offset: -330, locale: 'en-IN', languages: ['en-IN', 'hi', 'en-GB'] };
      }

      // Mathematical approximation based on longitude
      const hours = Math.round(lng / 15);
      const offsetMin = -hours * 60;
      let tzName = 'UTC';
      try {
        if (hours === 0) tzName = 'UTC';
        else if (hours > 0) tzName = `Etc/GMT-${hours}`;
        else tzName = `Etc/GMT+${Math.abs(hours)}`;
      } catch (e) {
        tzName = 'UTC';
      }
      return { timeZone: tzName, offset: offsetMin, locale: 'en-US', languages: ['en-US', 'en'] };
    }

    function isDSTInUS() {
      const now = new Date();
      const month = now.getUTCMonth();
      return month >= 2 && month < 10;
    }

    function isDSTInEurope() {
      const now = new Date();
      const month = now.getUTCMonth();
      return month >= 2 && month < 9;
    }

    function isDSTInAustralia() {
      const now = new Date();
      const month = now.getUTCMonth();
      return month >= 9 || month < 3;
    }

    function getTimezoneOffsetForName(name) {
      try {
        const now = new Date();
        const str = now.toLocaleString('en-US', { timeZone: name });
        const targetDate = new Date(str);
        return Math.round((now.getTime() - targetDate.getTime()) / 60000);
      } catch (e) {
        return 0;
      }
    }

    function getLocaleForTimezone(tz) {
      if (tz.includes('Tokyo')) return 'ja-JP';
      if (tz.includes('London')) return 'en-GB';
      if (tz.includes('Paris')) return 'fr-FR';
      if (tz.includes('Berlin')) return 'de-DE';
      if (tz.includes('Sydney')) return 'en-AU';
      if (tz.includes('Dubai')) return 'ar-AE';
      if (tz.includes('Kolkata')) return 'en-IN';
      return 'en-US';
    }

    function getLanguagesForTimezone(tz) {
      if (tz.includes('Tokyo')) return ['ja-JP', 'ja', 'en-US'];
      if (tz.includes('London')) return ['en-GB', 'en'];
      if (tz.includes('Paris')) return ['fr-FR', 'fr', 'en-US'];
      if (tz.includes('Berlin')) return ['de-DE', 'de', 'en-US'];
      if (tz.includes('Sydney')) return ['en-AU', 'en'];
      if (tz.includes('Dubai')) return ['ar-AE', 'en-US'];
      if (tz.includes('Kolkata')) return ['en-IN', 'hi', 'en-GB'];
      return ['en-US', 'en'];
    }

    window.addEventListener('morph-agent-update', (evt) => {
      let data = null;
      if (typeof evt.detail === 'string') {
        try { data = JSON.parse(evt.detail); } catch (e) { }
      } else if (evt.detail && typeof evt.detail === 'object' && Object.keys(evt.detail).length > 0) {
        data = evt.detail;
      }

      if (data) {
        if (window.location.hostname && (window.location.hostname === 'proxyium.com' || window.location.hostname.endsWith('.proxyium.com'))) {
          data.touchSpoofEnabled = false;
          data.geoSpoofEnabled = false;
        }
        window.__MORPH_AGENT_SETTINGS__ = data;
        isSettingsLoaded = true;
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
        const lat = Number.isFinite(Number(coords.lat)) && Math.abs(Number(coords.lat)) <= 90 ? Number(coords.lat) : 0;
        const lng = Number.isFinite(Number(coords.lng)) && Math.abs(Number(coords.lng)) <= 180 ? Number(coords.lng) : 0;

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
        } catch (e) { }

        return pos;
      }

      Geolocation.prototype.getCurrentPosition = new Proxy(Geolocation.prototype.getCurrentPosition, {
        apply(target, thisArg, args) {
          const success = args[0];
          if (typeof success !== 'function') throw new TypeError('A geolocation success callback is required');
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
                if (typeof error === 'function') error({code:2,message:'Privacy settings unavailable',PERMISSION_DENIED:1,POSITION_UNAVAILABLE:2,TIMEOUT:3});
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
          if (typeof success !== 'function') throw new TypeError('A geolocation success callback is required');
          const error = args[1];
          const options = args[2];
          const id = watchCounter++;
          const record = {kind:'pending',handle:null,initial:null};
          activeWatches.set(id, record);

          const run = () => {
            if (!activeWatches.has(id)) return;
            const s = window.__MORPH_AGENT_SETTINGS__ || {};
            if (s.geoSpoofEnabled) {
              if (typeof success === 'function') {
                record.initial = setTimeout(() => {if (activeWatches.has(id)) success(getMockPos());}, 0);
                const interval = setInterval(() => {
                  success(getMockPos());
                }, 1000);
                record.kind='mock'; record.handle=interval;
              }
            } else {
              const realId = Reflect.apply(target, thisArg, args);
              record.kind='native'; record.handle=realId;
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
                if (activeWatches.has(id) && typeof error === 'function') error({code:2,message:'Privacy settings unavailable'});
                activeWatches.delete(id);
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
            clearTimeout(val.initial);
            if (val.kind === 'mock') clearInterval(val.handle);
            if (val.kind === 'native') Reflect.apply(target, thisArg, [val.handle]);
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
                addEventListener: function () { },
                removeEventListener: function () { },
                dispatchEvent: function () { return true; }
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

    Function.prototype.toString = function () {
      if (spoofedFuncs.has(this)) {
        return 'function ' + (this.name || '') + '() { [native code] }';
      }
      return nativeToString.apply(this, arguments);
    };

    // Bulletproof Top-Level Battery API Spoofing (Bypasses all sync race conditions)
    if (!window.__MORPH_BATTERY_PROTECTED && window.navigator && window.Navigator) {
      window.__MORPH_BATTERY_PROTECTED = true;
      let origGetBattery = null;
      if (Navigator.prototype.getBattery) origGetBattery = Navigator.prototype.getBattery;
      else if (window.navigator.getBattery) origGetBattery = window.navigator.getBattery;

      if (origGetBattery) {
        const spoofBattery = function (...args) {
          // Battery wrapper lives outside applyStealthSettings; emit only when protection runs.
          return new Promise((resolve, reject) => {
            const checkAndResolve = () => {
              const s = window.__MORPH_AGENT_SETTINGS__ || {};
              if (s.jsProtectEnabled) {
                window.dispatchEvent(new CustomEvent('morph-threat-detected', {detail:{type:'Battery API',details:'Battery values masked'}}));
                const domainHash = Array.from(window.location.hostname || "localhost").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0);
                const hashVal = isNaN(domainHash) ? 0 : domainHash;
                resolve({
                  charging: false,
                  chargingTime: Infinity,
                  dischargingTime: 86400,
                  level: 0.85 - ((hashVal % 10) * 0.01),
                  onchargingchange: null,
                  onchargingtimechange: null,
                  ondischargingtimechange: null,
                  onlevelchange: null
                });
              } else {
                origGetBattery.apply(window.navigator, args).then(resolve).catch(reject);
              }
            };

            if (window.__MORPH_SYNC_LOADED || (window.__MORPH_AGENT_SETTINGS__ && typeof window.__MORPH_AGENT_SETTINGS__.jsProtectEnabled !== 'undefined')) {
              checkAndResolve();
            } else {
              let attempts = 0;
              const interval = setInterval(() => {
                if ((window.__MORPH_AGENT_SETTINGS__ && typeof window.__MORPH_AGENT_SETTINGS__.jsProtectEnabled !== 'undefined') || attempts++ > 50) {
                  clearInterval(interval);
                  checkAndResolve();
                }
              }, 10);
            }
          });
        };

        try {
          Object.defineProperty(Navigator.prototype, 'getBattery', { value: spoofBattery, configurable: true });
        } catch (e) {
          window.__MORPH_BATTERY_ERROR = 'NavProto Error: ' + e.message;
        }
        try {
          Object.defineProperty(window.navigator, 'getBattery', { value: spoofBattery, configurable: true });
        } catch (e) {
          window.__MORPH_BATTERY_ERROR = (window.__MORPH_BATTERY_ERROR ? window.__MORPH_BATTERY_ERROR + ' | ' : '') + 'WinNav Error: ' + e.message;
        }
      }
    }
  } catch (e) { }
})();
