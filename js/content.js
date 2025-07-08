// content.js
// Injects code to spoof navigator.userAgent and maxTouchPoints if enabled (Firefox/Manifest V2)

(function() {
  browser.storage.local.get(['selectedUA', 'touchSpoofEnabled', 'maxTouchPoints']).then((settings) => {
    if (settings.selectedUA) {
      injectUserAgentSpoof(settings.selectedUA);
    }
    if (settings.touchSpoofEnabled && typeof settings.maxTouchPoints === 'number') {
      injectTouchSpoof(settings.maxTouchPoints);
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
})(); 