(function() {
  if (window.__MORPH_INJECTED__) return;
  window.__MORPH_INJECTED__ = true;

  try {
    let cachedSettings = null;
    let isSettingsLoaded = false;
    const pendingCalls = [];
    const pendingWatches = [];

    try {
      const raw = sessionStorage.getItem('morph_agent_settings') || localStorage.getItem('morph_agent_settings');
      if (raw) {
        cachedSettings = JSON.parse(raw);
        isSettingsLoaded = true;
      }
    } catch (e) {}

    window.__MORPH_AGENT_SETTINGS__ = cachedSettings || window.__MORPH_AGENT_SETTINGS__ || {};

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

      // Stealth Proxy for getCurrentPosition
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

      // Stealth Proxy for watchPosition
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

      // Stealth Proxy for clearWatch
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
  } catch (e) {}
})();
