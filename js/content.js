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
          Object.defineProperty(Navigator.prototype, 'userAgent', {
            get: function() { return ${JSON.stringify(ua)}; },
            configurable: true
          });
        } catch (e) {
          try { window.navigator.userAgent = ${JSON.stringify(ua)}; } catch (e2) {}
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