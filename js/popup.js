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
  const geoToggle = document.getElementById('geo-toggle');
  const geoControls = document.getElementById('geo-controls');
  const geoPreset = document.getElementById('geo-preset');
  const customGeoInputs = document.getElementById('custom-geo-inputs');
  const geoLat = document.getElementById('geo-lat');
  const geoLng = document.getElementById('geo-lng');

  // Location Controls Event Listeners
  if (geoToggle && geoControls) {
    geoToggle.addEventListener('change', () => {
      geoControls.classList.toggle('visible', geoToggle.checked);
      geoControls.style.display = geoToggle.checked ? 'block' : 'none';
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
  const manifest = (browser.runtime && browser.runtime.getManifest) ? browser.runtime.getManifest() : { version: '4.0.0' };
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
      isInitialized = true;
    }).catch(() => {
      applyTheme('light');
      isInitialized = true;
    });
  }

  function applyTheme(theme) {
    document.body.classList.remove('dark-mode', 'light-mode');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.querySelector('.light-icon').style.display = 'none';
      themeToggle.querySelector('.dark-icon').style.display = 'block';
    } else {
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
      touchControls.classList.toggle('visible', isEnabled);
      
      if (isEnabled && selectedProfile && selectedProfile.profile.touchPoints !== undefined) {
        touchPointsInput.value = selectedProfile.profile.touchPoints;
      }
    });

    // Initialize touch controls visibility
    touchControls.classList.toggle('visible', touchToggle.checked);
  }

  // Status Messages
  function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message visible ${type}`;
    
    // Clear any existing timeout
    if (statusMessage.timeoutId) {
      clearTimeout(statusMessage.timeoutId);
    }
    
    // Set new timeout
    statusMessage.timeoutId = setTimeout(() => {
      statusMessage.classList.remove('visible');
      statusMessage.timeoutId = null;
    }, 3000);
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
    touchControls.classList.toggle('visible', touchToggle.checked);
    jsBlockToggle.checked = !!rule.jsBlocked;
    jsProtectToggle.checked = !!rule.jsProtected;
    
    // Set apply scope to current tab since this is a tab-specific rule
    const currentRadio = document.querySelector('input[name="apply-scope"][value="current"]');
    if (currentRadio) currentRadio.checked = true;
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
        touchControls.classList.toggle('visible', touchToggle.checked);
        jsBlockToggle.checked = !!settings.jsBlockEnabled;
        jsProtectToggle.checked = !!settings.jsProtectEnabled;

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
        
        // Set apply scope to all tabs for global settings
        const allRadio = document.querySelector('input[name="apply-scope"][value="all"]');
        if (allRadio) allRadio.checked = true;
      } else {
        // Set defaults
        selectCategory('desktop');
        touchToggle.checked = false;
        touchPointsInput.value = 0;
        touchControls.classList.remove('visible');
        jsBlockToggle.checked = false;
        jsProtectToggle.checked = false;
        if (geoToggle) {
          geoToggle.checked = false;
          if (geoControls) {
            geoControls.classList.remove('visible');
            geoControls.style.display = 'none';
          }
        }
        
        // Default to current tab
        const currentRadio = document.querySelector('input[name="apply-scope"][value="current"]');
        if (currentRadio) currentRadio.checked = true;
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
    const geoSpoofEnabled = geoToggle ? geoToggle.checked : false;
    const geoPresetValue = geoPreset ? geoPreset.value : '40.7128,-74.0060';
    const geoCoords = {
      lat: geoLat ? (parseFloat(geoLat.value) || 40.7128) : 40.7128,
      lng: geoLng ? (parseFloat(geoLng.value) || -74.0060) : -74.0060
    };
    const applyScope = document.querySelector('input[name="apply-scope"]:checked').value;

    if (!selectedUA) {
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
          geoSpoofEnabled,
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
            showStatus(`Applied to ${hostname}! Reload page to see changes.`);
          }).catch(error => {
            console.error('Failed to save site-specific rule:', error);
            showStatus('Failed to save site-specific rule', 'error');
          });
        }).catch(error => {
          console.error('Failed to get existing rules:', error);
          showStatus('Failed to access storage', 'error');
        });
      }).catch(error => {
        console.error('Failed to get current tab:', error);
        showStatus('Failed to get current tab information', 'error');
      });
    } else {
      // Apply globally
      const settings = {
        selectedUA,
        maxTouchPoints,
        touchSpoofEnabled,
        jsBlockEnabled,
        jsProtectEnabled,
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
          showStatus('Settings applied to all tabs successfully! Reload pages to see changes.');
        } else {
          showStatus('Failed to apply settings', 'error');
        }
      }).catch((error) => {
        console.error('Failed to save settings:', error);
        showStatus('Failed to save settings', 'error');
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

    // Reset to browser default user agent (not the selected profile)
    const resetData = {
      selectedUA: navigator.userAgent, // Use browser's original UA
      maxTouchPoints: 0,
      touchSpoofEnabled: false,
      jsBlockEnabled: false,
      jsProtectEnabled: false,
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
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
    
    // Wait for theme to be applied before loading settings
    setTimeout(() => {
      loadSettings();
    }, 100);
  }

  // Start the extension
  init();
});