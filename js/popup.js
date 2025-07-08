document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeToggle = document.getElementById('theme-toggle');
  const deviceCards = document.querySelectorAll('.device-card');
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

  // State
  let currentCategory = null;
  let currentPlatform = null;
  let selectedProfile = null;
  let isInitialized = false;

  // Browser compatibility
  const browser = window.browser || window.chrome;

  // Fallback for profiles if new structure isn't available
  if (typeof profilesStructured === 'undefined' && typeof profiles !== 'undefined') {
    // Create structured profiles from legacy array
    window.profilesStructured = {
      desktop: {
        name: 'Desktop & Laptop',
        platforms: {
          mixed: {
            name: 'All Platforms',
            variants: profiles.filter(p => !p.name.toLowerCase().includes('iphone') && !p.name.toLowerCase().includes('ipad') && !p.name.toLowerCase().includes('android')).map(p => ({ ...p, touchPoints: 0 }))
          }
        }
      },
      mobile: {
        name: 'Mobile Devices',
        platforms: {
          mixed: {
            name: 'All Platforms', 
            variants: profiles.filter(p => p.name.toLowerCase().includes('iphone') || p.name.toLowerCase().includes('android')).map(p => ({ ...p, touchPoints: 5 }))
          }
        }
      },
      tablet: {
        name: 'Tablet Devices',
        platforms: {
          mixed: {
            name: 'All Platforms',
            variants: profiles.filter(p => p.name.toLowerCase().includes('ipad')).map(p => ({ ...p, touchPoints: 10 }))
          }
        }
      },
      gaming: {
        name: 'Gaming Devices',
        platforms: {
          mixed: {
            name: 'All Platforms',
            variants: []
          }
        }
      }
    };
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
    populatePlatforms(category);
  }

  // Platform Management
  function populatePlatforms(category) {
    // Clear existing options
    platformSelect.innerHTML = '<option value="">Select platform...</option>';
    profileSelect.innerHTML = '<option value="">Select profile...</option>';

    if (!profilesStructured[category] || !profilesStructured[category].platforms) return;

    const platforms = profilesStructured[category].platforms;
    
    Object.keys(platforms).forEach(platformKey => {
      const platform = platforms[platformKey];
      const option = document.createElement('option');
      option.value = platformKey;
      option.textContent = platform.name;
      platformSelect.appendChild(option);
    });
  }

  function populateProfiles(category, platform) {
    // Clear existing options
    profileSelect.innerHTML = '<option value="">Select profile...</option>';

    if (!profilesStructured[category] || !profilesStructured[category].platforms[platform]) return;

    const variants = profilesStructured[category].platforms[platform].variants;
    
    variants.forEach((profile, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = profile.name;
      profileSelect.appendChild(option);
    });
  }

  function selectProfile(category, platform, index) {
    const profile = profilesStructured[category].platforms[platform].variants[index];
    if (!profile) return;

    selectedProfile = { category, platform, index, profile };
    
    // Update UI
    customUAInput.value = profile.ua;
    touchPointsInput.value = profile.touchPoints || 0;
    
    // Update selects
    platformSelect.value = platform;
    profileSelect.value = index;
  }

  // Event Listeners for selects
  platformSelect.addEventListener('change', (e) => {
    const platform = e.target.value;
    currentPlatform = platform;
    
    if (platform && currentCategory) {
      populateProfiles(currentCategory, platform);
    } else {
      profileSelect.innerHTML = '<option value="">Select profile...</option>';
    }
  });

  profileSelect.addEventListener('change', (e) => {
    const index = parseInt(e.target.value);
    
    if (!isNaN(index) && currentCategory && currentPlatform) {
      selectProfile(currentCategory, currentPlatform, index);
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
    
    setTimeout(() => {
      statusMessage.classList.remove('visible');
    }, 3000);
  }

  // Settings Management
  function loadSettings() {
    browser.runtime.sendMessage({ type: 'get-settings' }).then((settings) => {
      if (settings) {
        // Try to find matching profile
        let foundProfile = false;
        
        Object.keys(profilesStructured).forEach(category => {
          Object.keys(profilesStructured[category].platforms || {}).forEach(platform => {
            profilesStructured[category].platforms[platform].variants.forEach((profile, index) => {
              if (profile.ua === settings.selectedUA) {
                selectCategory(category);
                currentPlatform = platform;
                populateProfiles(category, platform);
                selectProfile(category, platform, index);
                foundProfile = true;
              }
            });
          });
        });

        if (!foundProfile) {
          customUAInput.value = settings.selectedUA || '';
        }

        touchToggle.checked = !!settings.touchSpoofEnabled;
        touchPointsInput.value = settings.maxTouchPoints || 0;
        touchControls.classList.toggle('visible', touchToggle.checked);
      } else {
        // Set defaults
        selectCategory('desktop');
        touchToggle.checked = false;
        touchPointsInput.value = 0;
        touchControls.classList.remove('visible');
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
        const url = new URL(currentTab.url);
        const hostname = url.hostname;

        // Create site-specific rule
        const rule = {
          id: Date.now(),
          website: hostname,
          userAgent: selectedUA,
          touchPoints: touchSpoofEnabled ? maxTouchPoints : 0
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
            showStatus(`Settings applied to ${hostname} successfully! Reload page to see changes.`);
          }).catch(error => {
            console.error('Failed to save site-specific rule:', error);
            showStatus('Failed to save site-specific rule', 'error');
          });
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
        applyScope
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
    const defaultPlatform = Object.keys(profilesStructured[defaultCategory].platforms)[0];
    const defaultProfile = profilesStructured[defaultCategory].platforms[defaultPlatform].variants[0];

    selectCategory(defaultCategory);
    currentPlatform = defaultPlatform;
    populateProfiles(defaultCategory, defaultPlatform);
    selectProfile(defaultCategory, defaultPlatform, 0);
    
    touchToggle.checked = false;
    touchPointsInput.value = 0;
    touchControls.classList.remove('visible');

    // Reset to browser default user agent (not the selected profile)
    const resetData = {
      selectedUA: navigator.userAgent, // Use browser's original UA
      maxTouchPoints: 0,
      touchSpoofEnabled: false,
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