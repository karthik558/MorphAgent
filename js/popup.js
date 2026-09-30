// Detect mobile Firefox (popup opens as full tab, not constrained popup)
if (window.innerWidth !== 400 || window.innerHeight > 600) {
  document.documentElement.classList.add('mobile');
}

// Immediately apply cached theme to avoid any visual flash
try {
  const initialTheme = localStorage.getItem('morph_theme') || 'dark';
  document.documentElement.classList.remove('dark-mode', 'light-mode');
  if (document.body) document.body.classList.remove('dark-mode', 'light-mode');
  document.documentElement.classList.add(initialTheme === 'light' ? 'light-mode' : 'dark-mode');
  if (document.body) {
    document.body.classList.add(initialTheme === 'light' ? 'light-mode' : 'dark-mode');
  }
} catch (e) {}

function startPopup() {
  // Cross-browser API adapter
  const browser = window.browser || window.chrome;

  // DOM Elements
  const themeToggle = document.getElementById('theme-toggle');
  const deviceCards = document.querySelectorAll('.device-card');
  const browserSelect = document.getElementById('browser-select');
  const platformSelect = document.getElementById('platform-select');
  const profileSelect = document.getElementById('profile-select');
  const customUAInput = document.getElementById('custom-ua');
  const touchToggle = document.getElementById('touch-toggle');
  const touchControls = document.getElementById('touch-controls');
  const touchPointsInput = document.getElementById('touch-points');
  const statusMessage = document.getElementById('status');
  const form = document.getElementById('ua-form');
  const resetBtn = document.getElementById('reset-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const jsBlockToggle = document.getElementById('js-block-toggle');
  const jsProtectToggle = document.getElementById('js-protect-toggle');
  const uaSpoofToggle = document.getElementById('ua-spoof-toggle');
  const geoToggle = document.getElementById('geo-toggle');
  const geoControls = document.getElementById('geo-controls');
  const geoPreset = document.getElementById('geo-preset');
  const customGeoInputs = document.getElementById('custom-geo-inputs');
  const geoLat = document.getElementById('geo-lat');
  const geoLng = document.getElementById('geo-lng');
  const rtcProtectToggle = document.getElementById('rtc-protect-toggle');
  const ghostModeToggle = document.getElementById('ghost-mode-toggle');
  const ghostControls = document.getElementById('ghost-controls');
  const ghostInterval = document.getElementById('ghost-interval');

  // AdBlock & Secure DNS Elements
  const adblockToggle = document.getElementById('adblock-toggle');
  const dnsProviderSelect = document.getElementById('dns-provider-select');
  const dnsCustomInputWrap = document.getElementById('dns-custom-input-wrap');
  const dnsCustomEndpoint = document.getElementById('dns-custom-endpoint');
  const dnsCurrentLabel = document.getElementById('dns-current-label');

  // Proxy & Proxyium Elements
  const proxyiumNodeSelect = document.getElementById('proxyium-node-select');
  const proxyiumStatusDesc = document.getElementById('proxyium-status-desc');
  const btnProxyiumCurrentTab = document.getElementById('btn-proxyium-current-tab');
  const browserProxyToggle = document.getElementById('browser-proxy-toggle');
  const popupProxySublabel = document.getElementById('popup-proxy-sublabel');

  // New buttons
  const btnCurrentTab = document.getElementById('btn-current-tab');
  const btnAllTabs = document.getElementById('btn-all-tabs');
  const copyUaBtn = document.getElementById('copy-ua-btn');
  const saveIndicator = document.getElementById('save-indicator');
  const saveIndicatorText = document.getElementById('save-indicator-text');
  let currentScope = 'current';

  // Theme Management (Initialized immediately at popup startup)
  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.remove('dark-mode', 'light-mode');
    document.body.classList.remove('dark-mode', 'light-mode');
    document.documentElement.classList.add(isDark ? 'dark-mode' : 'light-mode');
    document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');

    const lightIcon = themeToggle ? themeToggle.querySelector('.light-icon') : null;
    const darkIcon = themeToggle ? themeToggle.querySelector('.dark-icon') : null;

    if (isDark) {
      if (lightIcon) lightIcon.style.display = 'none';
      if (darkIcon) darkIcon.style.display = 'block';
    } else {
      if (lightIcon) lightIcon.style.display = 'block';
      if (darkIcon) darkIcon.style.display = 'none';
    }
  }

  function initTheme() {
    let currentSaved = 'dark';
    try {
      currentSaved = localStorage.getItem('morph_theme') || 'dark';
    } catch(e) {}
    applyTheme(currentSaved);

    if (browser && browser.storage && browser.storage.local) {
      try {
        browser.storage.local.get(['theme'], (data) => {
          const theme = (data && data.theme) ? data.theme : currentSaved;
          applyTheme(theme);
          try { localStorage.setItem('morph_theme', theme); } catch(e) {}
        });
      } catch(err) {}
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isDark = document.body.classList.contains('dark-mode') || document.documentElement.classList.contains('dark-mode');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      try {
        localStorage.setItem('morph_theme', newTheme);
      } catch(err) {}

      if (browser && browser.storage && browser.storage.local) {
        try {
          browser.storage.local.set({ theme: newTheme }, () => {
            if (browser.runtime && browser.runtime.sendMessage) {
              try {
                browser.runtime.sendMessage({
                  type: 'set-settings',
                  data: { theme: newTheme }
                }, () => {});
              } catch(err) {}
            }
          });
        } catch(e) {}
      }
    });
  }

  // Immediately initialize theme
  initTheme();

  function updateUASpoofUIState() {
    const enabled = uaSpoofToggle ? uaSpoofToggle.checked : true;
    if (customUAInput) {
      customUAInput.disabled = !enabled;
      customUAInput.style.opacity = enabled ? '1' : '0.5';
    }
    if (platformSelect) {
      platformSelect.disabled = !enabled;
      platformSelect.style.opacity = enabled ? '1' : '0.5';
    }
    if (browserSelect) {
      browserSelect.disabled = !enabled;
      browserSelect.style.opacity = enabled ? '1' : '0.5';
    }
    if (profileSelect) {
      profileSelect.disabled = !enabled;
      profileSelect.style.opacity = enabled ? '1' : '0.5';
    }
    deviceCards.forEach(card => {
      card.disabled = !enabled;
      card.style.opacity = enabled ? '1' : '0.5';
      const cardCat = card.dataset ? card.dataset.category : card.getAttribute('data-category');
      if (!enabled) {
        card.classList.remove('active');
      } else if (currentCategory && cardCat === currentCategory) {
        card.classList.add('active');
      }
    });
  }

  if (uaSpoofToggle) {
    uaSpoofToggle.addEventListener('change', updateUASpoofUIState);
  }

  // Scope Selection Handlers
  if (btnCurrentTab && btnAllTabs) {
    btnCurrentTab.addEventListener('click', () => {
      currentScope = 'current';
      btnCurrentTab.classList.add('btn-solid');
      btnCurrentTab.classList.remove('btn-ghost');
      btnAllTabs.classList.add('btn-ghost');
      btnAllTabs.classList.remove('btn-solid');
      if (isInitialized) saveSettings();
    });

    btnAllTabs.addEventListener('click', () => {
      currentScope = 'all';
      btnAllTabs.classList.add('btn-solid');
      btnAllTabs.classList.remove('btn-ghost');
      btnCurrentTab.classList.add('btn-ghost');
      btnCurrentTab.classList.remove('btn-solid');
      if (isInitialized) saveSettings();
    });
  }

  // Copy UA Handler
  if (copyUaBtn && customUAInput) {
    copyUaBtn.addEventListener('click', () => {
      customUAInput.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(customUAInput.value).catch(() => document.execCommand('copy'));
      } else {
        document.execCommand('copy');
      }
      showStatus('User Agent copied to clipboard');

      const originalHTML = copyUaBtn.innerHTML;
      copyUaBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      copyUaBtn.style.borderColor = 'var(--accent-green)';
      setTimeout(() => {
        copyUaBtn.innerHTML = originalHTML;
        copyUaBtn.style.borderColor = '';
      }, 1500);
    });
  }

  // Location Controls Event Listeners
  if (geoToggle && geoControls) {
    geoToggle.addEventListener('change', () => {
      geoControls.classList.toggle('visible', geoToggle.checked);
      geoControls.style.display = geoToggle.checked ? 'block' : 'none';
    });
  }

  if (ghostModeToggle && ghostControls) {
    ghostModeToggle.addEventListener('change', () => {
      ghostControls.style.display = ghostModeToggle.checked ? 'block' : 'none';
    });
  }

  if (geoPreset && customGeoInputs && geoLat && geoLng) {
    geoPreset.addEventListener('change', () => {
      const val = geoPreset.value;
      if (val === 'custom') {
        customGeoInputs.classList.add('visible');
        customGeoInputs.style.display = 'flex';
      } else {
        customGeoInputs.classList.remove('visible');
        customGeoInputs.style.display = 'none';
        const parts = val.split(',').map(Number);
        if (parts.length === 2) {
          geoLat.value = parts[0];
          geoLng.value = parts[1];
        }
      }
    });
  }

  // AdBlock & DNS Event Listeners & Helpers
  function updateDnsUI(providerId) {
    const pid = providerId || 'adguard';
    if (dnsCustomInputWrap) {
      dnsCustomInputWrap.style.display = pid === 'custom' ? 'block' : 'none';
    }
    if (dnsCurrentLabel) {
      if (pid === 'adguard') {
        dnsCurrentLabel.textContent = 'AdGuard DNS · Ad & Threat Shield';
      } else if (pid === 'cloudflare') {
        dnsCurrentLabel.textContent = 'Cloudflare 1.1.1.1 · Ultra-Fast Privacy';
      } else if (pid === 'quad9') {
        dnsCurrentLabel.textContent = 'Quad9 · Malware & Threat Shield';
      } else if (pid === 'nextdns') {
        dnsCurrentLabel.textContent = 'NextDNS · Cloud Firewall';
      } else if (pid === 'cleanbrowsing') {
        dnsCurrentLabel.textContent = 'CleanBrowsing · Family Protected';
      } else if (pid === 'custom') {
        dnsCurrentLabel.textContent = 'Custom DoH Resolver';
      } else {
        dnsCurrentLabel.textContent = 'System Default (Direct OS)';
      }
    }
  }

  function applyDnsAndAdblockData(res) {
    const data = res || {};
    if (adblockToggle) {
      adblockToggle.checked = data.adBlockEnabled !== false;
    }
    const provider = data.dnsProvider || 'adguard';
    if (dnsProviderSelect) {
      dnsProviderSelect.value = provider;
      updateDnsUI(provider);
    }
    if (dnsCustomEndpoint && data.dnsCustomEndpoint) {
      dnsCustomEndpoint.value = data.dnsCustomEndpoint;
    }
  }

  // Load DNS and AdBlock settings on popup startup from storage.local safely
  try {
    if (browser && browser.storage && browser.storage.local) {
      const getReq = browser.storage.local.get(['adBlockEnabled', 'dnsProvider', 'dnsCustomEndpoint'], (res) => {
        if (browser.runtime && browser.runtime.lastError) return;
        applyDnsAndAdblockData(res);
      });
      if (getReq && typeof getReq.then === 'function') {
        getReq.then(applyDnsAndAdblockData).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Error loading DNS and AdBlock settings in popup:', err);
  }

  if (adblockToggle) {
    adblockToggle.addEventListener('change', () => {
      const active = adblockToggle.checked;
      try {
        if (browser && browser.storage && browser.storage.local) {
          browser.storage.local.set({ adBlockEnabled: active }, () => {});
        }
        if (browser && browser.runtime && browser.runtime.sendMessage) {
          const p = browser.runtime.sendMessage({
            type: 'update-global-settings',
            data: { adBlockEnabled: active }
          });
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
        if (typeof showStatus === 'function') {
          showStatus(active ? 'Ad & Tracker Shield enabled' : 'Ad & Tracker Shield paused');
        }
      } catch (e) {
        console.warn('Failed to update adBlock toggle:', e);
      }
    });
  }

  if (dnsProviderSelect) {
    dnsProviderSelect.addEventListener('change', () => {
      const provider = dnsProviderSelect.value || 'adguard';
      updateDnsUI(provider);
      try {
        if (browser && browser.storage && browser.storage.local) {
          browser.storage.local.set({ dnsProvider: provider }, () => {});
        }
        if (browser && browser.runtime && browser.runtime.sendMessage) {
          const p = browser.runtime.sendMessage({
            type: 'update-global-settings',
            data: { dnsProvider: provider }
          });
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
        const optText = (dnsProviderSelect.selectedIndex >= 0 && dnsProviderSelect.options[dnsProviderSelect.selectedIndex])
          ? dnsProviderSelect.options[dnsProviderSelect.selectedIndex].text.split(' (')[0]
          : provider;
        if (typeof showStatus === 'function') {
          showStatus(`DNS switched to ${optText}`);
        }
      } catch (e) {
        console.warn('Failed to update dnsProvider select:', e);
      }
    });
  }

  if (dnsCustomEndpoint) {
    dnsCustomEndpoint.addEventListener('input', () => {
      const customUrl = dnsCustomEndpoint.value.trim();
      try {
        if (browser && browser.storage && browser.storage.local) {
          browser.storage.local.set({ dnsCustomEndpoint: customUrl }, () => {});
        }
        if (browser && browser.runtime && browser.runtime.sendMessage) {
          const p = browser.runtime.sendMessage({
            type: 'update-global-settings',
            data: { dnsCustomEndpoint: customUrl }
          });
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } catch (e) {}
    });
  }

  // Node labels mapping
  const proxyiumNodeLabels = {
    pl: 'Poland / France · Zero Footprint',
    us: 'United States · Geo-Unblock Exit',
    sg: 'Singapore · Asia-Pacific Fast Exit'
  };

  function updateProxyiumNodeUI(country) {
    if (proxyiumStatusDesc) {
      proxyiumStatusDesc.textContent = proxyiumNodeLabels[country] || 'Poland / France · Zero Footprint';
    }
    if (proxyiumNodeSelect && country) {
      proxyiumNodeSelect.value = country;
    }
  }

  // Proxy UI update helper
  function updateProxyUI(pConfig) {
    if (pConfig && pConfig.proxyiumCountry) {
      updateProxyiumNodeUI(pConfig.proxyiumCountry);
    }
    if (!popupProxySublabel) return;
    if (pConfig && pConfig.enabled && pConfig.mode !== 'direct') {
      const mode = pConfig.mode === 'pac_script' ? 'PAC Script' : (pConfig.protocol || 'SOCKS5').toUpperCase();
      const host = pConfig.host || '127.0.0.1';
      const port = pConfig.port || 9050;
      popupProxySublabel.textContent = `Active: ${mode} (${host}:${port})`;
      popupProxySublabel.style.color = 'var(--accent-green)';
    } else {
      popupProxySublabel.textContent = 'Direct (No Proxy Active)';
      popupProxySublabel.style.color = 'var(--text-tertiary)';
    }
  }

  // Proxyium Current Tab Tunnel
  if (btnProxyiumCurrentTab) {
    btnProxyiumCurrentTab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const country = proxyiumNodeSelect ? proxyiumNodeSelect.value : 'pl';

      // Visual feedback on button
      btnProxyiumCurrentTab.classList.add('tunneling');
      btnProxyiumCurrentTab.innerHTML = `
        <div class="tunnel-btn-content">
          <span class="tunnel-spinner"></span>
          <span class="tunnel-btn-label">Connecting Tunnel...</span>
        </div>
      `;

      // Instantly ensure touch and location spoofing are turned OFF
      if (touchToggle) {
        touchToggle.checked = false;
        if (touchControls) touchControls.style.display = 'none';
      }
      if (geoToggle) {
        geoToggle.checked = false;
        if (geoControls) {
          geoControls.classList.remove('visible');
          geoControls.style.display = 'none';
        }
      }
      if (browser && browser.storage && browser.storage.local) {
        browser.storage.local.set({ geoSpoofEnabled: false, touchSpoofEnabled: false });
      }

      function performTunnel(targetUrl) {
        let cleanUrl = targetUrl;
        if (!cleanUrl || cleanUrl.startsWith('chrome://') || cleanUrl.startsWith('about:') || cleanUrl.startsWith('moz-extension://') || cleanUrl.startsWith('chrome-extension://')) {
          cleanUrl = 'https://duckduckgo.com';
        }

        if (typeof showStatus === 'function') {
          showStatus('Tunneling tab via Proxyium...');
        }

        // Try runtime message to background service worker
        let messageDispatched = false;
        if (browser && browser.runtime && browser.runtime.sendMessage) {
          try {
            browser.runtime.sendMessage({
              type: 'launch-proxyium',
              url: cleanUrl,
              country: country,
              newTab: false
            }, () => {
              if (browser.runtime.lastError) {
                console.warn('[MorphAgent] Tunnel message callback:', browser.runtime.lastError.message);
                directTunnelFallback(cleanUrl, country);
              } else {
                setTimeout(() => window.close(), 300);
              }
            });
            messageDispatched = true;
          } catch(err) {
            console.warn('[MorphAgent] runtime.sendMessage threw:', err);
          }
        }

        if (!messageDispatched) {
          directTunnelFallback(cleanUrl, country);
        }
      }

      function directTunnelFallback(url, cty) {
        const dest = `https://proxyium.com/?morph_url=${encodeURIComponent(url)}&morph_country=${encodeURIComponent(cty || 'pl')}`;
        if (browser && browser.tabs && browser.tabs.query) {
          browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0] && tabs[0].id) {
              browser.tabs.update(tabs[0].id, { url: dest });
              setTimeout(() => window.close(), 250);
            } else if (browser.tabs.create) {
              browser.tabs.create({ url: dest });
              setTimeout(() => window.close(), 250);
            } else {
              window.open(dest, '_blank');
            }
          });
        } else {
          window.open(dest, '_blank');
        }
      }

      if (browser && browser.tabs && browser.tabs.query) {
        try {
          browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs && tabs[0];
            const currentUrl = activeTab ? activeTab.url : 'https://duckduckgo.com';
            performTunnel(currentUrl);
          });
        } catch(err) {
          performTunnel('https://duckduckgo.com');
        }
      } else {
        performTunnel('https://duckduckgo.com');
      }
    });
  }

  // Proxyium Node Select change
  if (proxyiumNodeSelect) {
    proxyiumNodeSelect.addEventListener('change', (e) => {
      if (e) e.stopPropagation();
      const country = proxyiumNodeSelect.value;
      updateProxyiumNodeUI(country);
      if (browser && browser.storage && browser.storage.local) {
        browser.storage.local.get(['proxyConfig'], (data) => {
          const pConfig = (data && data.proxyConfig) ? data.proxyConfig : {};
          pConfig.proxyiumCountry = country;
          browser.storage.local.set({ proxyConfig: pConfig });
        });
      }
    });
  }

  // Browser Proxy Switcher Toggle
  if (browserProxyToggle) {
    browserProxyToggle.addEventListener('change', (e) => {
      if (e) e.stopPropagation();
      const enabled = browserProxyToggle.checked;
      if (browser && browser.storage && browser.storage.local) {
        browser.storage.local.get(['proxyConfig'], (data) => {
          const pConfig = (data && data.proxyConfig) ? data.proxyConfig : {
            mode: 'manual',
            protocol: 'socks5',
            host: '127.0.0.1',
            port: 9050,
            bypassList: 'localhost, 127.0.0.1, <local>'
          };
          pConfig.enabled = enabled;
          if (enabled && pConfig.mode === 'direct') {
            pConfig.mode = 'manual';
          }
          updateProxyUI(pConfig);
          if (browser.runtime && browser.runtime.sendMessage) {
            try {
              browser.runtime.sendMessage({
                type: 'set-browser-proxy',
                data: pConfig
              }, () => {
                if (typeof showStatus === 'function') {
                  showStatus(enabled ? 'Browser proxy activated' : 'Reverted to direct connection');
                }
              });
            } catch(e) {}
          }
        });
      }
    });
  }

  // Configure Proxy Button -> opens Advanced Settings Proxy Section
  const btnConfigureProxy = document.getElementById('btn-configure-proxy');
  if (btnConfigureProxy) {
    btnConfigureProxy.addEventListener('click', (e) => {
      e.preventDefault();
      if (browser && browser.tabs && browser.tabs.create) {
        browser.tabs.create({ url: browser.runtime.getURL('advanced-settings.html#section-proxy') });
      }
    });
  }

  // State
  let currentCategory = null;
  let currentBrowser = null;
  let currentPlatform = null;
  let selectedProfile = null;
  let isInitialized = false;

  // Set version from manifest
  const manifest = (browser.runtime && browser.runtime.getManifest) ? browser.runtime.getManifest() : { version: '4.5.0' };
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge && manifest.version) {
    versionBadge.textContent = 'v' + manifest.version;
  }

  // Initialize browser types from profiles.js
  const availableBrowserTypes = window.browserTypes || {
    all: { name: 'All Browsers', pattern: '', platforms: ['all'] },
    chrome: { name: 'Google Chrome', pattern: 'Chrome', patterns: ['Chrome', 'CriOS'], platforms: ['all'] },
    firefox: { name: 'Mozilla Firefox', pattern: 'Firefox', patterns: ['Firefox', 'FxiOS'], platforms: ['all'] },
    safari: { name: 'Safari', pattern: 'Safari', patterns: ['Safari'], platforms: ['ios', 'ipad', 'macos'] },
    edge: { name: 'Microsoft Edge', pattern: 'Edg', patterns: ['Edg', 'EdgiOS'], platforms: ['all'] },
    opera: { name: 'Opera', pattern: 'OPR', patterns: ['OPR', 'Opera'], platforms: ['all'] },
    samsung: { name: 'Samsung Internet', pattern: 'SamsungBrowser', patterns: ['SamsungBrowser'], platforms: ['android'] }
  };

  // Use new profiles structure or fall back to legacy
  const profilesData = window.profiles || window.profilesStructured || {};

  // Debug: Log the loaded profiles data
  console.log('Loaded profiles data:', profilesData);
  console.log('Available categories:', Object.keys(profilesData));

  // Fallback for profiles if new structure isn't available
  if (typeof profiles === 'undefined' && typeof profilesStructured !== 'undefined') {
    // Use the legacy structured profiles
    window.profiles = profilesStructured;
  }

  function loadCustomLocations() {
    if (!geoPreset || !browser || !browser.storage || !browser.storage.sync) return;
    try {
      browser.storage.sync.get(['customLocations'], (data) => {
        const customLocs = (data && data.customLocations) ? data.customLocations : [];
        customLocs.forEach(loc => {
          const option = document.createElement('option');
          option.value = `${loc.lat},${loc.lng}`;
          option.textContent = `${loc.name} (${loc.lat}, ${loc.lng})`;
          // Insert before the 'custom' option (which is the last one)
          geoPreset.insertBefore(option, geoPreset.lastElementChild);
        });
      });
    } catch(e) {}
  }

  // Real-time synchronization across popup and open pages
  if (browser && browser.storage && browser.storage.onChanged) {
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        if (changes.theme) {
          const updatedTheme = changes.theme.newValue || 'dark';
          applyTheme(updatedTheme);
          try { localStorage.setItem('morph_theme', updatedTheme); } catch(e) {}
        }
        if (changes.dnsProvider && dnsProviderSelect) {
          dnsProviderSelect.value = changes.dnsProvider.newValue;
          updateDnsUI(changes.dnsProvider.newValue);
        }
        if (changes.dnsCustomEndpoint && dnsCustomEndpoint) {
          dnsCustomEndpoint.value = changes.dnsCustomEndpoint.newValue || '';
        }
        if (changes.adBlockEnabled && adblockToggle) {
          adblockToggle.checked = changes.adBlockEnabled.newValue !== false;
        }
        if (changes.proxyConfig) {
          const cfg = changes.proxyConfig.newValue || {};
          if (proxyiumNodeSelect && cfg.proxyiumCountry) {
            proxyiumNodeSelect.value = cfg.proxyiumCountry;
          }
          if (browserProxyToggle) {
            browserProxyToggle.checked = !!cfg.enabled;
          }
          updateProxyUI(cfg);
        }
      }
    });
  }



  // Filter profiles by browser type with multi-pattern support and smart fallback
  function filterProfilesByBrowser(profilesList, browserType) {
    if (!browserType || browserType === 'all') {
      return profilesList;
    }

    const bObj = availableBrowserTypes[browserType];
    if (!bObj) return profilesList;

    const patterns = bObj.patterns || (bObj.pattern ? [bObj.pattern] : []);

    const filtered = profilesList.filter(profile => {
      if (!profile.ua) return false;
      if (browserType === 'safari') {
        return profile.ua.includes('Safari') &&
          !profile.ua.includes('Chrome') &&
          !profile.ua.includes('Edg') &&
          !profile.ua.includes('OPR') &&
          !profile.ua.includes('CriOS');
      }
      return patterns.some(pat => pat && profile.ua.includes(pat));
    });

    if (filtered.length > 0) {
      return filtered;
    }

    // Dynamic adaptation fallback so no dropdown is ever blank!
    return profilesList.map(profile => {
      let newUA = profile.ua;
      if (browserType === 'chrome') {
        if (newUA.includes('iPhone') || newUA.includes('iPad')) {
          newUA = newUA.replace(/Version\/[0-9.]+(\s+Mobile\/[A-Z0-9]+)?\s+Safari\/[0-9.]+/, 'CriOS/145.0.7632.112 Mobile/15E148 Safari/604.1');
        } else {
          newUA = newUA.replace(/Version\/[0-9.]+\s+Safari\/[0-9.]+/, 'Chrome/145.0.0.0 Safari/537.36');
        }
      } else if (browserType === 'firefox') {
        if (newUA.includes('iPhone') || newUA.includes('iPad')) {
          newUA = newUA.replace(/Version\/[0-9.]+(\s+Mobile\/[A-Z0-9]+)?\s+Safari\/[0-9.]+/, 'FxiOS/142.0 Mobile/15E148 Safari/604.1');
        } else {
          newUA = newUA.replace(/Version\/[0-9.]+\s+Safari\/[0-9.]+/, 'Firefox/142.0');
        }
      } else if (browserType === 'edge') {
        if (newUA.includes('iPhone') || newUA.includes('iPad')) {
          newUA = newUA.replace(/Version\/[0-9.]+(\s+Mobile\/[A-Z0-9]+)?\s+Safari\/[0-9.]+/, 'EdgiOS/145.0.3211.55 Mobile/15E148 Safari/604.1');
        } else {
          newUA = newUA.replace(/Version\/[0-9.]+\s+Safari\/[0-9.]+/, 'Chrome/145.0.0.0 Safari/537.36 Edg/145.0.3211.55');
        }
      }
      return {
        ...profile,
        name: profile.name.includes('(') ? profile.name : `${profile.name} (${bObj.name || browserType})`,
        ua: newUA
      };
    });
  }

  // Device Category Selection
  function initDeviceCards() {
    deviceCards.forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset ? card.dataset.category : card.getAttribute('data-category');
        selectCategory(category);
      });
    });
  }

  function selectCategory(category) {
    // Update active state
    deviceCards.forEach(card => {
      const cardCat = card.dataset ? card.dataset.category : card.getAttribute('data-category');
      card.classList.toggle('active', cardCat === category);
    });

    currentCategory = category;
    currentPlatform = null; // Reset platform when category changes
    currentBrowser = null; // Reset browser when category changes

    // Populate platforms for this category
    populatePlatforms(category);
  }

  // Platform Management
  function populatePlatforms(category) {
    // Clear existing options
    platformSelect.innerHTML = '<option value="">Select platform...</option>';
    browserSelect.innerHTML = '<option value="">Select browser...</option>';
    profileSelect.innerHTML = '<option value="">Select profile...</option>';

    // Reset current state
    currentPlatform = null;
    currentBrowser = null;

    if (!profilesData[category] || !profilesData[category].platforms) {
      console.warn('No platforms found for category:', category);
      return;
    }

    const platforms = profilesData[category].platforms;

    Object.keys(platforms).forEach(platformKey => {
      const platform = platforms[platformKey];
      const option = document.createElement('option');
      option.value = platformKey;
      option.textContent = platform.name;
      platformSelect.appendChild(option);
    });
  }

  // Update browser options based on selected platform
  function updateBrowserOptions() {
    // Clear existing browser options
    browserSelect.innerHTML = '<option value="">Select browser...</option>';
    profileSelect.innerHTML = '<option value="">Select profile...</option>';

    if (!currentPlatform) {
      return;
    }

    // Add browser options based on current platform
    Object.keys(availableBrowserTypes).forEach(browserKey => {
      const browser = availableBrowserTypes[browserKey];

      // Check if browser should be shown for current platform
      const shouldShow = browser.platforms.includes('all') ||
        browser.platforms.includes(currentPlatform);

      if (shouldShow) {
        const option = document.createElement('option');
        option.value = browserKey;
        option.textContent = browser.name;
        browserSelect.appendChild(option);
      }
    });
  }

  function populateProfiles(category, platform, browserType) {
    // Clear existing options
    profileSelect.innerHTML = '<option value="">Select profile...</option>';

    if (!profilesData[category] || !profilesData[category].platforms[platform]) {
      console.warn('No profiles found for category/platform:', category, platform);
      return;
    }

    let variants = profilesData[category].platforms[platform].variants;

    if (!variants || variants.length === 0) {
      console.warn('No variants found for:', category, platform);
      return;
    }

    // Filter by browser type if selected
    if (browserType && browserType !== 'all') {
      variants = filterProfilesByBrowser(variants, browserType);
    }

    // Cache active variants list for selectProfile lookup
    profileSelect.activeVariants = variants;

    variants.forEach((profile, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = profile.name;
      profileSelect.appendChild(option);
    });
  }

  function selectProfile(category, platform, index, browserType = null) {
    let variants = profileSelect.activeVariants;

    if (!variants || !variants[index]) {
      if (profilesData[category] && profilesData[category].platforms[platform]) {
        variants = profilesData[category].platforms[platform].variants;
        if (browserType && browserType !== 'all') {
          variants = filterProfilesByBrowser(variants, browserType);
        }
      }
    }

    const profile = variants ? variants[index] : null;
    if (!profile) {
      console.warn('Profile not found at index:', index);
      return;
    }

    selectedProfile = { category, platform, index, profile, browserType };

    // Update UI
    customUAInput.value = profile.ua;
    touchPointsInput.value = profile.touchPoints || 0;

    // Update selects
    platformSelect.value = platform;
    if (browserType) {
      browserSelect.value = browserType;
    }
    profileSelect.value = index;

    console.log('Selected profile:', profile.name, 'UA:', profile.ua);
  }

  // Event Listeners for selects
  platformSelect.addEventListener('change', (e) => {
    const platform = e.target.value;
    currentPlatform = platform;

    if (platform && currentCategory) {
      // Update browser options immediately when platform is selected
      updateBrowserOptions();
    } else {
      browserSelect.innerHTML = '<option value="">Select browser...</option>';
      profileSelect.innerHTML = '<option value="">Select profile...</option>';
    }
  });

  browserSelect.addEventListener('change', (e) => {
    currentBrowser = e.target.value;

    // Populate profiles with browser filter if category and platform are selected
    if (currentCategory && currentPlatform) {
      populateProfiles(currentCategory, currentPlatform, currentBrowser);
    }
  });

  profileSelect.addEventListener('change', (e) => {
    const index = parseInt(e.target.value);

    if (!isNaN(index) && currentCategory && currentPlatform) {
      selectProfile(currentCategory, currentPlatform, index, currentBrowser);
    }
  });

  // Touch Controls
  function initTouchControls() {
    touchToggle.addEventListener('change', () => {
      const isEnabled = touchToggle.checked;
      touchControls.style.display = isEnabled ? 'block' : 'none';

      if (isEnabled && selectedProfile && selectedProfile.profile.touchPoints !== undefined) {
        touchPointsInput.value = selectedProfile.profile.touchPoints;
      }
    });

    // Initialize touch controls visibility
    touchControls.style.display = touchToggle.checked ? 'block' : 'none';
  }

  // Status Messages
  function showStatus(message, type = 'success') {
    if (saveIndicator && saveIndicatorText) {
      saveIndicatorText.textContent = message;
      saveIndicator.className = `save-indicator visible ${type}`;

      // Clear any existing timeout
      if (saveIndicator.timeoutId) {
        clearTimeout(saveIndicator.timeoutId);
      }

      // Set new timeout
      saveIndicator.timeoutId = setTimeout(() => {
        saveIndicator.classList.remove('visible');
        saveIndicator.timeoutId = null;
      }, 2000);
    }
  }

  // Settings Management
  function loadSettings() {
    function proceedWithTab(currentTab) {
      if (currentTab && currentTab.url && currentTab.url.includes('proxyium.com')) {
        // Tab is inside Proxyium tunnel - guarantee touch & location spoofing are OFF
        if (touchToggle) {
          touchToggle.checked = false;
          if (touchControls) touchControls.style.display = 'none';
        }
        if (geoToggle) {
          geoToggle.checked = false;
          if (geoControls) {
            geoControls.classList.remove('visible');
            geoControls.style.display = 'none';
          }
        }
        loadGlobalSettings(true);
        return;
      }

      if (currentTab && currentTab.url && !currentTab.url.startsWith('chrome://') && !currentTab.url.startsWith('moz-extension://') && !currentTab.url.startsWith('about:')) {
        try {
          const url = new URL(currentTab.url);
          const hostname = url.hostname;

          if (browser && browser.storage && browser.storage.sync) {
            browser.storage.sync.get(['websiteRules'], (result) => {
              const websiteRules = (result && result.websiteRules) ? result.websiteRules : [];
              const currentRule = websiteRules.find(rule => rule.website === hostname && !hostname.includes('proxyium.com'));
              if (currentRule) {
                loadTabSpecificSettings(currentRule);
                return;
              }
              loadGlobalSettings();
            });
            return;
          }
        } catch (error) {
          loadGlobalSettings();
          return;
        }
      }
      loadGlobalSettings();
    }

    if (browser && browser.tabs && browser.tabs.query) {
      try {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs.length > 0) {
            proceedWithTab(tabs[0]);
          } else {
            loadGlobalSettings();
          }
        });
      } catch (e) {
        loadGlobalSettings();
      }
    } else {
      loadGlobalSettings();
    }
  }

  function loadTabSpecificSettings(rule) {
    // Restore full UI state if available
    if (rule.uiState && rule.uiState.category) {
      const { category, platform, browserType, profileIndex } = rule.uiState;
      selectCategory(category);
      if (platform) {
        currentPlatform = platform;
        platformSelect.value = platform;
        updateBrowserOptions();
        if (browserType) {
          currentBrowser = browserType;
          browserSelect.value = browserType;
        }
        populateProfiles(category, platform, browserType || null);
        if (profileIndex !== null && profileIndex !== undefined) {
          selectProfile(category, platform, profileIndex, browserType || null);
        }
      }
    } else {
      // Fallback: find matching profile by UA string
      let foundProfile = false;

      Object.keys(profilesData).forEach(category => {
        Object.keys(profilesData[category].platforms || {}).forEach(platform => {
          profilesData[category].platforms[platform].variants.forEach((profile, index) => {
            if (!foundProfile && profile.ua === rule.userAgent) {
              selectCategory(category);
              currentPlatform = platform;
              platformSelect.value = platform;
              updateBrowserOptions();
              populateProfiles(category, platform, null);
              selectProfile(category, platform, index, null);
              foundProfile = true;
            }
          });
        });
      });

      if (!foundProfile) {
        customUAInput.value = rule.userAgent || '';
      }
    }

    touchToggle.checked = rule.touchSpoofEnabled !== undefined ? !!rule.touchSpoofEnabled : false;
    touchPointsInput.value = rule.touchPoints || 0;
    touchControls.style.display = touchToggle.checked ? 'block' : 'none';
    jsBlockToggle.checked = !!rule.jsBlocked;
    jsProtectToggle.checked = !!rule.jsProtected;

    if (rtcProtectToggle) rtcProtectToggle.checked = rule.rtcProtectEnabled !== false;
    if (ghostModeToggle) {
      ghostModeToggle.checked = !!rule.ghostModeEnabled;
      if (ghostControls) ghostControls.style.display = ghostModeToggle.checked ? 'block' : 'none';
      if (ghostInterval) ghostInterval.value = rule.ghostInterval || 15;
    }

    if (uaSpoofToggle) {
      uaSpoofToggle.checked = rule.uaSpoofEnabled !== false;
      updateUASpoofUIState();
    }

    if (geoToggle && geoControls) {
      geoToggle.checked = !!rule.geoSpoofEnabled;
      geoControls.classList.toggle('visible', geoToggle.checked);
      geoControls.style.display = geoToggle.checked ? 'block' : 'none';
      if (geoPreset && rule.geoPresetValue) {
        geoPreset.value = rule.geoPresetValue;
        if (customGeoInputs) {
          const isCustom = rule.geoPresetValue === 'custom';
          customGeoInputs.classList.toggle('visible', isCustom);
          customGeoInputs.style.display = isCustom ? 'flex' : 'none';
        }
      }
      if (rule.geoCoords) {
        if (geoLat) geoLat.value = rule.geoCoords.lat;
        if (geoLng) geoLng.value = rule.geoCoords.lng;
      }
    }

    // Set apply scope to current tab since this is a tab-specific rule
    currentScope = 'current';
    btnCurrentTab.classList.add('btn-solid');
    btnCurrentTab.classList.remove('btn-ghost');
    btnAllTabs.classList.add('btn-ghost');
    btnAllTabs.classList.remove('btn-solid');
    isInitialized = true;
  }

  function loadGlobalSettings(isTunnelTab = false) {
    function applyLoadedSettings(settings) {
      if (settings) {
        // Restore full UI state if available
        if (settings.uiState && settings.uiState.category) {
          const { category, platform, browserType, profileIndex } = settings.uiState;
          selectCategory(category);
          if (platform) {
            currentPlatform = platform;
            platformSelect.value = platform;
            updateBrowserOptions();
            if (browserType) {
              currentBrowser = browserType;
              browserSelect.value = browserType;
            }
            populateProfiles(category, platform, browserType || null);
            if (profileIndex !== null && profileIndex !== undefined) {
              selectProfile(category, platform, profileIndex, browserType || null);
            }
          }
        } else {
          // Fallback: find matching profile by UA string
          let foundProfile = false;

          Object.keys(profilesData).forEach(category => {
            Object.keys(profilesData[category].platforms || {}).forEach(platform => {
              profilesData[category].platforms[platform].variants.forEach((profile, index) => {
                if (!foundProfile && profile.ua === settings.selectedUA) {
                  selectCategory(category);
                  currentPlatform = platform;
                  platformSelect.value = platform;
                  updateBrowserOptions();
                  populateProfiles(category, platform, null);
                  selectProfile(category, platform, index, null);
                  foundProfile = true;
                }
              });
            });
          });

          if (!foundProfile) {
            customUAInput.value = settings.selectedUA || '';
          }
        }

        if (isTunnelTab) {
          touchToggle.checked = false;
          touchPointsInput.value = 0;
          touchControls.style.display = 'none';
        } else {
          touchToggle.checked = !!settings.touchSpoofEnabled;
          touchPointsInput.value = settings.maxTouchPoints || 0;
          touchControls.style.display = touchToggle.checked ? 'block' : 'none';
        }
        jsBlockToggle.checked = !!settings.jsBlockEnabled;
        jsProtectToggle.checked = !!settings.jsProtectEnabled;

        if (rtcProtectToggle) rtcProtectToggle.checked = settings.rtcProtectEnabled !== false;
        if (ghostModeToggle) {
          ghostModeToggle.checked = !!settings.ghostModeEnabled;
          if (ghostControls) ghostControls.style.display = ghostModeToggle.checked ? 'block' : 'none';
          if (ghostInterval) ghostInterval.value = settings.ghostInterval || 15;
        }
        if (uaSpoofToggle) {
          uaSpoofToggle.checked = settings.uaSpoofEnabled !== false;
          updateUASpoofUIState();
        }

        if (geoToggle && geoControls) {
          geoToggle.checked = isTunnelTab ? false : !!settings.geoSpoofEnabled;
          geoControls.classList.toggle('visible', geoToggle.checked);
          geoControls.style.display = geoToggle.checked ? 'block' : 'none';
          if (geoPreset && settings.geoPresetValue) {
            geoPreset.value = settings.geoPresetValue;
            if (customGeoInputs) {
              const isCustom = settings.geoPresetValue === 'custom';
              customGeoInputs.classList.toggle('visible', isCustom);
              customGeoInputs.style.display = isCustom ? 'flex' : 'none';
            }
          }
          if (settings.geoCoords) {
            if (geoLat) geoLat.value = settings.geoCoords.lat;
            if (geoLng) geoLng.value = settings.geoCoords.lng;
          }
        }

        if (adblockToggle) {
          adblockToggle.checked = settings.adBlockEnabled !== false;
        }
        if (dnsProviderSelect && settings.dnsProvider) {
          dnsProviderSelect.value = settings.dnsProvider;
          updateDnsUI(settings.dnsProvider);
        }
        if (dnsCustomEndpoint && settings.dnsCustomEndpoint) {
          dnsCustomEndpoint.value = settings.dnsCustomEndpoint;
        }

        if (settings.proxyConfig) {
          if (proxyiumNodeSelect && settings.proxyConfig.proxyiumCountry) {
            proxyiumNodeSelect.value = settings.proxyConfig.proxyiumCountry;
          }
          if (browserProxyToggle) {
            browserProxyToggle.checked = !!settings.proxyConfig.enabled;
          }
          updateProxyUI(settings.proxyConfig);
        }

        currentScope = 'all';
        btnAllTabs.classList.add('btn-solid');
        btnAllTabs.classList.remove('btn-ghost');
        btnCurrentTab.classList.add('btn-ghost');
        btnCurrentTab.classList.remove('btn-solid');
      } else {
        // Set defaults
        selectCategory('desktop');
        touchToggle.checked = false;
        touchPointsInput.value = 0;
        touchControls.style.display = 'none';
        jsBlockToggle.checked = false;
        jsProtectToggle.checked = false;
        if (rtcProtectToggle) rtcProtectToggle.checked = true;
        if (ghostModeToggle) {
          ghostModeToggle.checked = false;
          if (ghostControls) ghostControls.style.display = 'none';
          if (ghostInterval) ghostInterval.value = 15;
        }
        if (uaSpoofToggle) {
          uaSpoofToggle.checked = true;
          updateUASpoofUIState();
        }
        if (geoToggle) {
          geoToggle.checked = false;
          if (geoControls) {
            geoControls.classList.remove('visible');
            geoControls.style.display = 'none';
          }
        }

        currentScope = 'current';
        btnCurrentTab.classList.add('btn-solid');
        btnCurrentTab.classList.remove('btn-ghost');
        btnAllTabs.classList.add('btn-ghost');
        btnAllTabs.classList.remove('btn-solid');
      }
      isInitialized = true;
    }

    if (browser && browser.runtime && browser.runtime.sendMessage) {
      try {
        browser.runtime.sendMessage({ type: 'get-settings' }, (settings) => {
          if (browser.runtime && browser.runtime.lastError) {
            console.warn('[MorphAgent] get-settings error:', browser.runtime.lastError.message);
            applyLoadedSettings(null);
            return;
          }
          applyLoadedSettings(settings);
        });
      } catch (err) {
        console.warn('[MorphAgent] loadGlobalSettings exception:', err);
        applyLoadedSettings(null);
      }
    } else {
      applyLoadedSettings(null);
    }
  }

  function saveSettings() {
    const selectedUA = customUAInput.value.trim();
    const maxTouchPoints = parseInt(touchPointsInput.value, 10) || 0;
    const touchSpoofEnabled = touchToggle.checked;
    const jsBlockEnabled = jsBlockToggle.checked;
    const jsProtectEnabled = jsProtectToggle.checked;
    const rtcProtectEnabled = rtcProtectToggle ? rtcProtectToggle.checked : true;
    const ghostModeEnabled = ghostModeToggle ? ghostModeToggle.checked : false;
    const ghostIntervalVal = ghostInterval ? parseInt(ghostInterval.value, 10) || 15 : 15;
    const uaSpoofEnabled = uaSpoofToggle ? uaSpoofToggle.checked : true;
    const geoSpoofEnabled = geoToggle ? geoToggle.checked : false;
    const geoPresetValue = geoPreset ? geoPreset.value : '40.7128,-74.0060';
    let geoCoords = { lat: 40.7128, lng: -74.0060 };
    if (geoPresetValue && geoPresetValue !== 'custom') {
      const parts = geoPresetValue.split(',').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        geoCoords = { lat: parts[0], lng: parts[1] };
      }
    } else {
      geoCoords = {
        lat: geoLat ? (parseFloat(geoLat.value) || 40.7128) : 40.7128,
        lng: geoLng ? (parseFloat(geoLng.value) || -74.0060) : -74.0060
      };
    }
    const applyScope = currentScope;

    if (!selectedUA && uaSpoofEnabled) {
      showStatus('Please select a profile or enter a custom user agent', 'error');
      return;
    }

    if (applyScope === 'current') {
      // Get current tab URL and create a site-specific rule
      if (browser && browser.tabs && browser.tabs.query) {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs || tabs.length === 0) {
            showStatus('Unable to get current tab information', 'error');
            return;
          }

          const currentTab = tabs[0];

          // Validate tab URL
          if (!currentTab.url || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('moz-extension://') || currentTab.url.startsWith('about:') || currentTab.url.includes('proxyium.com')) {
            showStatus('Cannot apply settings to this type of page', 'error');
            return;
          }

          let hostname;
          try {
            const url = new URL(currentTab.url);
            hostname = url.hostname;

            if (!hostname) {
              showStatus('Invalid URL detected', 'error');
              return;
            }
          } catch (error) {
            console.error('Failed to parse URL:', currentTab.url, error);
            showStatus('Failed to parse current page URL', 'error');
            return;
          }

          // Create site-specific rule
          const rule = {
            id: Date.now(),
            website: hostname,
            userAgent: selectedUA,
            touchPoints: touchSpoofEnabled ? maxTouchPoints : 0,
            touchSpoofEnabled: touchSpoofEnabled,
            jsBlocked: jsBlockEnabled,
            jsProtected: jsProtectEnabled,
            rtcProtectEnabled,
            ghostModeEnabled,
            ghostInterval: ghostIntervalVal,
            uaSpoofEnabled,
            geoSpoofEnabled,
            geoPresetValue,
            geoCoords,
            uiState: {
              category: currentCategory,
              platform: currentPlatform,
              browserType: currentBrowser,
              profileIndex: selectedProfile ? selectedProfile.index : null
            }
          };

          // Get existing rules and add/update this one
          if (browser && browser.storage && browser.storage.sync) {
            browser.storage.sync.get(['websiteRules'], (result) => {
              let websiteRules = (result && result.websiteRules) ? result.websiteRules : [];

              // Remove existing rule for this website and clean out any bogus proxyium rules
              websiteRules = websiteRules.filter(r => r.website !== hostname && !r.website.includes('proxyium.com'));

              // Add new rule
              websiteRules.push(rule);

              // Save updated rules
              browser.storage.sync.set({ websiteRules }, () => {
                if (browser.runtime && browser.runtime.lastError) {
                  console.error('Failed to save site-specific rule:', browser.runtime.lastError);
                  showStatus('Error', 'error');
                } else {
                  showStatus('Saved');
                }
              });
            });
          } else {
            showStatus('Saved');
          }
        });
      } else {
        showStatus('Tabs API unavailable', 'error');
      }
    } else {
      // Apply globally
      const settings = {
        selectedUA,
        maxTouchPoints,
        touchSpoofEnabled,
        jsBlockEnabled,
        jsProtectEnabled,
        rtcProtectEnabled,
        ghostModeEnabled,
        ghostInterval: ghostIntervalVal,
        uaSpoofEnabled,
        geoSpoofEnabled,
        geoPresetValue,
        geoCoords,
        applyScope,
        adBlockEnabled: adblockToggle ? adblockToggle.checked : true,
        dnsProvider: dnsProviderSelect ? dnsProviderSelect.value : 'adguard',
        dnsCustomEndpoint: dnsCustomEndpoint ? dnsCustomEndpoint.value.trim() : '',
        uiState: {
          category: currentCategory,
          platform: currentPlatform,
          browserType: currentBrowser,
          profileIndex: selectedProfile ? selectedProfile.index : null
        }
      };

      if (browser && browser.runtime && browser.runtime.sendMessage) {
        try {
          browser.runtime.sendMessage({
            type: 'set-settings',
            data: settings
          }, (response) => {
            if (response && response.success !== false) {
              showStatus('Saved');
            } else {
              showStatus('Saved');
            }
          });
        } catch (error) {
          console.error('Failed to save settings:', error);
          showStatus('Error', 'error');
        }
      } else {
        showStatus('Saved');
      }
    }
  }

  function resetSettings() {
    // Get default profile (first desktop profile)
    const defaultCategory = 'desktop';
    if (profilesData && profilesData[defaultCategory] && profilesData[defaultCategory].platforms) {
      const platformKeys = Object.keys(profilesData[defaultCategory].platforms);
      if (platformKeys.length > 0) {
        const defaultPlatform = platformKeys[0];
        const platformObj = profilesData[defaultCategory].platforms[defaultPlatform];
        if (platformObj && platformObj.variants && platformObj.variants.length > 0) {
          selectCategory(defaultCategory);
          currentPlatform = defaultPlatform;
          updateBrowserOptions();
          populateProfiles(defaultCategory, defaultPlatform, null);
          selectProfile(defaultCategory, defaultPlatform, 0, null);
        }
      }
    }

    touchToggle.checked = false;
    touchPointsInput.value = 0;
    touchControls.classList.remove('visible');
    touchControls.style.display = 'none';
    if (geoToggle) {
      geoToggle.checked = false;
      if (geoControls) {
        geoControls.classList.remove('visible');
        geoControls.style.display = 'none';
      }
    }
    jsBlockToggle.checked = false;
    jsProtectToggle.checked = false;
    if (rtcProtectToggle) rtcProtectToggle.checked = true;
    if (ghostModeToggle) {
      ghostModeToggle.checked = false;
      if (ghostControls) ghostControls.style.display = 'none';
      if (ghostInterval) ghostInterval.value = 15;
    }

    // Reset to browser default user agent (not the selected profile)
    const resetData = {
      selectedUA: navigator.userAgent, // Use browser's original UA
      maxTouchPoints: 0,
      touchSpoofEnabled: false,
      jsBlockEnabled: false,
      jsProtectEnabled: false,
      rtcProtectEnabled: true,
      ghostModeEnabled: false,
      ghostInterval: 15,
      geoSpoofEnabled: false,
      geoPresetValue: '40.7128,-74.0060',
      geoCoords: { lat: 40.7128, lng: -74.0060 },
      applyScope: 'current'
    };

    // Clear the custom UA input
    customUAInput.value = '';

    if (browser && browser.runtime && browser.runtime.sendMessage) {
      try {
        browser.runtime.sendMessage({
          type: 'set-settings',
          data: resetData
        }, () => {
          showStatus('Settings reset to default');
        });
      } catch (error) {
        console.error('Failed to reset settings:', error);
        showStatus('Failed to reset settings', 'error');
      }
    } else {
      showStatus('Settings reset to default');
    }
  }

  // Advanced Settings
  function openAdvancedSettings(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const targetUrl = (browser && browser.runtime && browser.runtime.getURL)
      ? browser.runtime.getURL('advanced-settings.html')
      : 'advanced-settings.html';

    // 1. Try native options page
    if (browser && browser.runtime && browser.runtime.openOptionsPage) {
      try {
        browser.runtime.openOptionsPage(() => {
          if (browser.runtime.lastError) {
            fallbackOpenSettings(targetUrl);
          }
        });
        return;
      } catch (err) {}
    }

    fallbackOpenSettings(targetUrl);
  }

  function fallbackOpenSettings(targetUrl) {
    if (browser && browser.tabs && browser.tabs.create) {
      try {
        browser.tabs.create({ url: targetUrl });
        return;
      } catch (err) {}
    }
    try {
      window.open(targetUrl, '_blank');
    } catch(err) {
      window.location.href = targetUrl;
    }
  }

  // Event Listeners
  form.addEventListener('change', (e) => {
    if (isInitialized) {
      saveSettings();
    }
  });

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetSettings();
  });

  if (settingsBtn) {
    settingsBtn.addEventListener('click', openAdvancedSettings);
  }

  // Custom UA input changes
  customUAInput.addEventListener('input', () => {
    // Clear profile selection when user types custom UA
    if (customUAInput.value.trim() && selectedProfile) {
      profileSelect.value = '';
      selectedProfile = null;
    }
  });


  // Initialize Extension
  function init() {
    initTheme();

    // Check if profiles data is available
    if (!profilesData || Object.keys(profilesData).length === 0) {
      console.warn('[MorphAgent] Profiles data not available yet');
    } else {
      initDeviceCards();
      initTouchControls();
    }

    // Query active tab and check for threats
    if (browser && browser.tabs && browser.tabs.query) {
      try {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
            try {
              const url = new URL(tabs[0].url);
              const hostname = url.hostname;
              const threatBanner = document.getElementById('threat-banner');
              const threatDetails = document.getElementById('threat-details');

              if (browser.storage && browser.storage.local) {
                browser.storage.local.get(['threatLogs'], (res) => {
                  const logs = (res && res.threatLogs) ? res.threatLogs : [];
                  const recentThreats = logs.filter(log => log.domain === hostname && (Date.now() - log.timestamp < 15 * 60 * 1000));
                  if (recentThreats.length > 0 && threatBanner && threatDetails) {
                    threatBanner.style.display = 'flex';
                    const types = [...new Set(recentThreats.map(t => t.type))];
                    threatDetails.textContent = types.slice(0, 3).join(', ') + (types.length > 3 ? '...' : '');

                    // Color code the banner based on volume
                    if (recentThreats.length > 10) {
                      threatBanner.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
                      threatBanner.style.borderColor = 'rgba(255, 0, 0, 0.4)';
                      threatBanner.querySelector('.threat-text strong').textContent = 'High Threat Detected';
                    }
                  }
                });
              }
            } catch (e) {}
          }
        });
      } catch (e) {}
    }

    // Load saved settings
    setTimeout(() => {
      loadSettings();
    }, 50);
  }

  // Start the extension
  init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPopup);
} else {
  startPopup();
}