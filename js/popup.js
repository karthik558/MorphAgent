// Detect mobile Firefox (popup opens as full tab, not constrained popup)
if (window.innerWidth !== 400 || window.innerHeight > 600) {
  document.documentElement.classList.add('mobile');
}

document.addEventListener('DOMContentLoaded', () => {
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
  
  // New buttons
  const btnCurrentTab = document.getElementById('btn-current-tab');
  const btnAllTabs = document.getElementById('btn-all-tabs');
  const copyUaBtn = document.getElementById('copy-ua-btn');
  const saveIndicator = document.getElementById('save-indicator');
  const saveIndicatorText = document.getElementById('save-indicator-text');
  let currentScope = 'current';

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
      if (!enabled) {
        card.classList.remove('active');
      } else if (currentCategory && card.dataset.category === currentCategory) {
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
    });

    btnAllTabs.addEventListener('click', () => {
      currentScope = 'all';
      btnAllTabs.classList.add('btn-solid');
      btnAllTabs.classList.remove('btn-ghost');
      btnCurrentTab.classList.add('btn-ghost');
      btnCurrentTab.classList.remove('btn-solid');
    });
  }

  // Copy UA Handler
  if (copyUaBtn && customUAInput) {
    copyUaBtn.addEventListener('click', () => {
      customUAInput.select();
      document.execCommand('copy');
      showStatus('User Agent copied to clipboard');
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

  // State
  let currentCategory = null;
  let currentBrowser = null;
  let currentPlatform = null;
  let selectedProfile = null;
  let isInitialized = false;

  // Browser compatibility
  const browser = window.browser || window.chrome;

  // Set version from manifest
  const manifest = (browser.runtime && browser.runtime.getManifest) ? browser.runtime.getManifest() : { version: '4.0.2' };
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

  // Theme Management
  function initTheme() {
    browser.storage.local.get(['theme']).then((data) => {
      const theme = data.theme || 'light';
      applyTheme(theme);
      loadCustomLocations();
      isInitialized = true;
    }).catch(() => {
      applyTheme('light');
      loadCustomLocations();
      isInitialized = true;
    });
  }

  function loadCustomLocations() {
    if (!geoPreset) return;
    browser.storage.sync.get(['customLocations']).then((data) => {
      const customLocs = data.customLocations || [];
      customLocs.forEach(loc => {
        const option = document.createElement('option');
        option.value = `${loc.lat},${loc.lng}`;
        option.textContent = `${loc.name} (${loc.lat}, ${loc.lng})`;
        // Insert before the 'custom' option (which is the last one)
        geoPreset.insertBefore(option, geoPreset.lastElementChild);
      });
    }).catch(console.error);
  }

  function applyTheme(theme) {
    document.documentElement.classList.remove('dark-mode', 'light-mode');
    document.body.classList.remove('dark-mode', 'light-mode');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      themeToggle.querySelector('.light-icon').style.display = 'none';
      themeToggle.querySelector('.dark-icon').style.display = 'block';
    } else {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
      themeToggle.querySelector('.light-icon').style.display = 'block';
      themeToggle.querySelector('.dark-icon').style.display = 'none';
    }
  }

  themeToggle.addEventListener('click', () => {
    if (!isInitialized) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    
    browser.storage.local.set({ theme: newTheme }).then(() => {
      applyTheme(newTheme);
    }).catch(console.error);
  });



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
        const category = card.dataset.category;
        selectCategory(category);
      });
    });
  }

  function selectCategory(category) {
    // Update active state
    deviceCards.forEach(card => {
      card.classList.toggle('active', card.dataset.category === category);
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
    // First, check if current tab has specific settings
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        if (currentTab.url && !currentTab.url.startsWith('chrome://') && !currentTab.url.startsWith('moz-extension://') && !currentTab.url.startsWith('about:')) {
          try {
            const url = new URL(currentTab.url);
            const hostname = url.hostname;
            
            // Check if current tab has specific settings
            browser.storage.sync.get(['websiteRules']).then(result => {
              const websiteRules = result.websiteRules || [];
              const currentRule = websiteRules.find(rule => rule.website === hostname);
              
              if (currentRule) {
                // Load current tab specific settings
                loadTabSpecificSettings(currentRule);
                return;
              }
              
              // No tab-specific settings, load global settings
              loadGlobalSettings();
            }).catch(() => {
              loadGlobalSettings();
            });
          } catch (error) {
            loadGlobalSettings();
          }
        } else {
          loadGlobalSettings();
        }
      } else {
        loadGlobalSettings();
      }
    }).catch(() => {
      loadGlobalSettings();
    });
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

    touchToggle.checked = rule.touchPoints > 0;
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
  }

  function loadGlobalSettings() {
    browser.runtime.sendMessage({ type: 'get-settings' }).then((settings) => {
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

        touchToggle.checked = !!settings.touchSpoofEnabled;
        touchPointsInput.value = settings.maxTouchPoints || 0;
        touchControls.style.display = touchToggle.checked ? 'block' : 'none';
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
          geoToggle.checked = !!settings.geoSpoofEnabled;
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
    }).catch((error) => {
      console.error('Failed to load settings:', error);
      showStatus('Failed to load settings', 'error');
    });
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
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length === 0) {
          showStatus('Unable to get current tab information', 'error');
          return;
        }

        const currentTab = tabs[0];
        
        // Validate tab URL
        if (!currentTab.url || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('moz-extension://') || currentTab.url.startsWith('about:')) {
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
        browser.storage.sync.get(['websiteRules']).then(result => {
          let websiteRules = result.websiteRules || [];
          
          // Remove existing rule for this website
          websiteRules = websiteRules.filter(r => r.website !== hostname);
          
          // Add new rule
          websiteRules.push(rule);

          // Save updated rules
          browser.storage.sync.set({ websiteRules }).then(() => {
            showStatus('Saved');
          }).catch(error => {
            console.error('Failed to save site-specific rule:', error);
            showStatus('Error', 'error');
          });
        }).catch(error => {
          console.error('Failed to get existing rules:', error);
          showStatus('Failed to access storage', 'error');
        });
      }).catch(error => {
        console.error('Failed to get current tab:', error);
        showStatus('Error', 'error');
      });
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
        uiState: {
          category: currentCategory,
          platform: currentPlatform,
          browserType: currentBrowser,
          profileIndex: selectedProfile ? selectedProfile.index : null
        }
      };

      browser.runtime.sendMessage({
        type: 'set-settings',
        data: settings
      }).then((response) => {
        if (response && response.success !== false) {
          showStatus('Saved');
        } else {
          showStatus('Error', 'error');
        }
      }).catch((error) => {
        console.error('Failed to save settings:', error);
        showStatus('Error', 'error');
      });
    }
  }

  function resetSettings() {
    // Get default profile (first desktop profile)
    const defaultCategory = 'desktop';
    const defaultPlatform = Object.keys(profilesData[defaultCategory].platforms)[0];
    const defaultProfile = profilesData[defaultCategory].platforms[defaultPlatform].variants[0];

    selectCategory(defaultCategory);
    currentPlatform = defaultPlatform;
    updateBrowserOptions();
    populateProfiles(defaultCategory, defaultPlatform, null);
    selectProfile(defaultCategory, defaultPlatform, 0, null);
    
    touchToggle.checked = false;
    touchPointsInput.value = 0;
    touchControls.classList.remove('visible');
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
      applyScope: 'current'
    };

    // Clear the custom UA input
    customUAInput.value = '';

    browser.runtime.sendMessage({
      type: 'set-settings',
      data: resetData
    }).then(() => {
      showStatus('Settings reset to default');
    }).catch((error) => {
      console.error('Failed to reset settings:', error);
      showStatus('Failed to reset settings', 'error');
    });
  }

  // Advanced Settings
  function openAdvancedSettings() {
    // Open advanced settings in a new tab
    browser.tabs.create({
      url: browser.runtime.getURL('advanced-settings.html')
    });
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

  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openAdvancedSettings();
  });

  // Custom UA input changes
  customUAInput.addEventListener('input', () => {
    // Clear profile selection when user types custom UA
    if (customUAInput.value.trim() && selectedProfile) {
      profileSelect.value = '';
      selectedProfile = null;
    }
  });

  if (copyUaBtn) {
    copyUaBtn.addEventListener('click', () => {
      const ua = customUAInput.value.trim();
      if (ua) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(ua).then(() => {
            showStatus('Copied!');
          });
        }
      }
    });
  }

  if (btnCurrentTab && btnAllTabs) {
    btnCurrentTab.addEventListener('click', () => {
      currentScope = 'current';
      btnCurrentTab.classList.add('btn-solid');
      btnCurrentTab.classList.remove('btn-ghost');
      btnAllTabs.classList.add('btn-ghost');
      btnAllTabs.classList.remove('btn-solid');
      saveSettings();
    });

    btnAllTabs.addEventListener('click', () => {
      currentScope = 'all';
      btnAllTabs.classList.add('btn-solid');
      btnAllTabs.classList.remove('btn-ghost');
      btnCurrentTab.classList.add('btn-ghost');
      btnCurrentTab.classList.remove('btn-solid');
      saveSettings();
    });
  }

  // Initialize Extension
  function init() {
    // Check if profiles data is available
    if (!profilesData || Object.keys(profilesData).length === 0) {
      console.error('No profiles data available!');
      showStatus('Error: Profile data not loaded. Please refresh the extension.', 'error');
      return;
    }
    
    initTheme();
    initDeviceCards();
    initTouchControls();

    // Query active tab and check for threats
    if (browser.tabs && browser.tabs.query) {
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs && tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
          const url = new URL(tabs[0].url);
          const hostname = url.hostname;
          const threatBanner = document.getElementById('threat-banner');
          const threatDetails = document.getElementById('threat-details');

          // Check for threats in the last 15 minutes for this domain
          browser.storage.local.get(['threatLogs']).then(res => {
              const logs = res.threatLogs || [];
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
      });
    }
    
    // Wait for theme to be applied before loading settings
    setTimeout(() => {
      loadSettings();
    }, 100);
  }

  // Start the extension
  init();
});