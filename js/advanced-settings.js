document.addEventListener('DOMContentLoaded', () => {
  // Cross-browser API adapter
  const browser = window.browser || window.chrome;

  // Elements
  const themeToggle = document.getElementById('themeToggle');
  const closeBtn = document.getElementById('closeBtn');
  const addRuleBtn = document.getElementById('addRuleBtn');
  // Elements
  const addBlockBtn = document.getElementById('addBlockBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const debugBtn = document.getElementById('debugBtn');
  const resetAllBtn = document.getElementById('factoryResetBtn');
  const importFile = document.getElementById('importFile');

  const websiteUrlInput = document.getElementById('websiteUrl');
  const customUaInput = document.getElementById('customUaInput');
  const customUaText = document.getElementById('customUaText');
  const categorySelect = document.getElementById('categorySelect');
  const platformSelect = document.getElementById('platformSelect');
  const browserSelect = document.getElementById('browserSelect');
  const profileSelect = document.getElementById('profileSelect');
  const touchPointsInput = document.getElementById('touchPoints');
  const jsBlockRuleCheckbox = document.getElementById('jsBlockRule');
  const jsProtectRuleCheckbox = document.getElementById('jsProtectRule');
  const mediaQueryRuleCheckbox = document.getElementById('mediaQueryRule');
  const timingShieldRuleCheckbox = document.getElementById('timingShieldRule');
  const blockUrlInput = document.getElementById('blockUrl');
  const geoSpoofRuleCheckbox = document.getElementById('geoSpoofRule');
  const geoCoordsPresetSelect = document.getElementById('geoCoordsPreset');
  const geoCustomCoordsDiv = document.getElementById('geoCustomCoords');
  const geoLatRuleInput = document.getElementById('geoLatRule');
  const geoLngRuleInput = document.getElementById('geoLngRule');
  const geoCoordsGroupDiv = document.getElementById('geoCoordsGroup');

  const rulesItems = document.getElementById('rulesItems');
  const blockItems = document.getElementById('blockItems');
  const statusMessage = document.getElementById('statusMessage');
  const statusText = document.getElementById('statusText');

  // Custom Locations Elements
  const locNameInput = document.getElementById('newLocName');
  const locLatInput = document.getElementById('newLocLat');
  const locLngInput = document.getElementById('newLocLng');
  const addLocBtn = document.getElementById('addLocationBtn');
  const customLocItems = document.getElementById('customLocationsList');

  // Tab-specific settings elements
  const refreshTabsBtn = document.getElementById('refreshTabsBtn');
  const clearAllTabsBtn = document.getElementById('clearTabSettingsBtn');
  const tabSettingsItems = document.getElementById('tabSettingsItems');

  // State
  let websiteRules = [];
  let blockList = [];
  let customLocations = [];
  let editingRule = null;
  let editingBlock = null;
  let editingLocation = null;

  // Tab-specific state
  let tabSettings = [];

  let allPlatforms = {};
  if (typeof profilesStructured !== 'undefined') {
    Object.entries(profilesStructured).forEach(([catKey, cat]) => {
      Object.entries(cat.platforms).forEach(([platKey, plat]) => {
        allPlatforms[platKey] = { ...plat, category: catKey };
      });
    });
  }

  // Initialize
  init();

  function init() {
    loadSettings();
    setupTheme();
    populateUserAgentOptions();
    renderRules();
    renderBlockList();
    renderLocations();
    setupEventListeners();
    loadTabSettings();
    renderAnalytics();
  }

  function renderAnalytics() {
    const browser = window.browser || window.chrome;
    browser.storage.local.get(['threatLogs'], (result) => {
      const logs = result.threatLogs || [];
      const totalEl = document.getElementById('analytics-total');
      const domainEl = document.getElementById('analytics-domain');
      const canvasEl = document.getElementById('threatChart');
      
      if (!totalEl || !domainEl || !canvasEl) return;
      
      totalEl.textContent = logs.length.toString();
      
      if (logs.length > 0) {
        // Calculate most targeted domain
        const domainCounts = {};
        logs.forEach(log => {
          domainCounts[log.domain] = (domainCounts[log.domain] || 0) + 1;
        });
        const maxDomain = Object.keys(domainCounts).reduce((a, b) => domainCounts[a] > domainCounts[b] ? a : b);
        domainEl.textContent = maxDomain;
        
        // Prepare chart data (Threat types frequency)
        const typeCounts = {};
        logs.forEach(log => {
          typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
        });
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#94a3b8' : '#475569';
        const gridColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        if (window.threatChartInstance) {
          window.threatChartInstance.destroy();
        }
        
        if (typeof Chart !== 'undefined') {
          window.threatChartInstance = new Chart(canvasEl, {
            type: 'bar',
            data: {
              labels: Object.keys(typeCounts),
              datasets: [{
                label: 'Threats Blocked',
                data: Object.values(typeCounts),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
              },
              plugins: {
                legend: { display: false }
              }
            }
          });
        }
      }
    });
  }

  function renderBlockList() {
    if (blockList.length === 0) {
      blockItems.innerHTML = `
        <tr>
          <td colspan="2">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <p>No blocked websites yet</p>
                <span>Add websites where user agent spoofing should be disabled</span>
              </div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    blockItems.innerHTML = blockList.map(item => `
      <tr>
        <td>${escapeHtml(item.website)}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline edit-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-block='${JSON.stringify(item)}'>Edit</button>
            <button class="btn btn-danger-outline delete-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-block-id="${item.id}">Remove</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Add event listeners to block delete buttons
    document.querySelectorAll('.block-item .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const blockId = parseInt(e.target.getAttribute('data-block-id'));
        deleteBlock(blockId);
      });
    });
  }
    function populateUserAgentOptions() {
      categorySelect.innerHTML = '<option value="">Category...</option>';
      if (typeof profilesStructured !== 'undefined') {
        Object.entries(profilesStructured).forEach(([catKey, cat]) => {
          const option = document.createElement('option');
          option.value = catKey;
          option.textContent = cat.name;
          categorySelect.appendChild(option);
        });
      }
    }

    function setupEventListeners() {
      // Theme toggle
      themeToggle.addEventListener('click', toggleTheme);

      // Close button
      closeBtn.addEventListener('click', () => {
        window.close();
      });

      // Sidebar Navigation
      const sidebarLinks = document.querySelectorAll('.sidebar-link');
      const settingsSections = document.querySelectorAll('.settings-section');

      sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          sidebarLinks.forEach(l => l.classList.remove('active'));
          settingsSections.forEach(s => s.classList.remove('active-section'));

          e.target.classList.add('active');
          const targetId = e.target.getAttribute('data-target');
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.classList.add('active-section');
          }
        });
      });
      // Add rule
      addRuleBtn.addEventListener('click', addOrUpdateRule);

      // Geo Spoof logic
      geoSpoofRuleCheckbox.addEventListener('change', (e) => {
        geoCoordsGroupDiv.style.display = e.target.checked ? 'block' : 'none';
      });
      geoCoordsPresetSelect.addEventListener('change', (e) => {
        geoCustomCoordsDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
      });

      // Add block
      addBlockBtn.addEventListener('click', addBlock);

      // Add Custom Location
      if (addLocBtn) addLocBtn.addEventListener('click', addLocation);

      // Import/Export
      exportBtn.addEventListener('click', exportSettings);
      importBtn.addEventListener('click', () => importFile.click());
      debugBtn.addEventListener('click', openExtensionDebug);
      importFile.addEventListener('change', importSettings);

      // Reset all
      resetAllBtn.addEventListener('click', resetAllSettings);

      // Enter key handling
      websiteUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addOrUpdateRule();
      });

      // Storage change listeners
      const browser = window.browser || window.chrome;
      browser.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
          if (changes.websiteRules) {
            websiteRules = changes.websiteRules.newValue || [];
            renderRules();
            // Also refresh tab settings since they depend on website rules
            loadTabSettings();
          }
          if (changes.blockList) {
            blockList = changes.blockList.newValue || [];
            renderBlockList();
          }
          if (changes.customLocations) {
            customLocations = changes.customLocations.newValue || [];
            renderLocations();
          }
        }
      });

      blockUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBlock();
      });

      // Tab-specific buttons
      refreshTabsBtn.addEventListener('click', loadTabSettings);
      clearAllTabsBtn.addEventListener('click', clearAllTabSettings);
    }

    function loadSettings() {
      const browser = window.browser || window.chrome;
      browser.storage.sync.get(['websiteRules', 'blockList', 'customLocations'], (result) => {
        websiteRules = result.websiteRules || [];
        blockList = result.blockList || [];
        customLocations = result.customLocations || [];
        renderRules();
        renderBlockList();
        renderLocations();
      });
    }

    function saveSettings() {
      const browser = window.browser || window.chrome;
      browser.storage.sync.set({
        websiteRules: websiteRules,
        blockList: blockList,
        customLocations: customLocations
      }, () => {
        showStatus('Settings saved successfully!');
      });
    }

    function setupTheme() {
      const browser = window.browser || window.chrome;
      browser.storage.local.get(['theme'], (result) => {
        const theme = result.theme || 'light';
        applyTheme(theme);
      });
    }

    function applyTheme(theme) {
      document.body.classList.remove('dark-mode', 'light-mode');
      const lightIcon = themeToggle.querySelector('.light-icon');
      const darkIcon = themeToggle.querySelector('.dark-icon');

      if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (lightIcon) lightIcon.style.display = 'none';
        if (darkIcon) darkIcon.style.display = 'block';
      } else {
        document.body.classList.add('light-mode');
        if (lightIcon) lightIcon.style.display = 'block';
        if (darkIcon) darkIcon.style.display = 'none';
      }
    }

    function toggleTheme() {
      const browser = window.browser || window.chrome;
      const isDark = document.body.classList.contains('dark-mode');
      const newTheme = isDark ? 'light' : 'dark';

      browser.storage.local.set({ theme: newTheme }, () => {
        applyTheme(newTheme);
      });
    }





    categorySelect.addEventListener('change', (e) => {
      const catKey = e.target.value;
      platformSelect.innerHTML = '<option value="">Platform...</option>';
      browserSelect.innerHTML = '<option value="">Browser...</option>';
      profileSelect.innerHTML = '<option value="">Device...</option>';
      platformSelect.disabled = true;
      browserSelect.disabled = true;
      profileSelect.disabled = true;
      
      if (!catKey || typeof profilesStructured === 'undefined') return;
      
      const cat = profilesStructured[catKey];
      if (cat && cat.platforms) {
        platformSelect.disabled = false;
        Object.entries(cat.platforms).forEach(([platKey, plat]) => {
          const option = document.createElement('option');
          option.value = platKey;
          option.textContent = plat.name;
          platformSelect.appendChild(option);
        });
      }
    });

    platformSelect.addEventListener('change', (e) => {
      const platKey = e.target.value;
      browserSelect.innerHTML = '<option value="">Browser...</option>';
      profileSelect.innerHTML = '<option value="">Device...</option>';
      profileSelect.disabled = true;
      
      if (!platKey) {
        browserSelect.disabled = true;
        return;
      }
      
      browserSelect.disabled = false;
      const option = document.createElement('option');
      option.value = 'all';
      option.textContent = 'Default / All';
      browserSelect.appendChild(option);
      // For simplicity, we just use "Default / All" in advanced settings unless we copy browserTypes
      if (typeof browserTypes !== 'undefined') {
        Object.entries(browserTypes).forEach(([bKey, bVal]) => {
          if (bKey !== 'all' && (bVal.platforms.includes('all') || bVal.platforms.includes(platKey))) {
            const opt = document.createElement('option');
            opt.value = bKey;
            opt.textContent = bVal.name;
            browserSelect.appendChild(opt);
          }
        });
      }
    });

    function filterProfilesByBrowser(profilesList, browserType) {
      if (typeof browserTypes === 'undefined') return profilesList;
      const bObj = browserTypes[browserType];
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

      if (filtered.length > 0) return filtered;

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

    browserSelect.addEventListener('change', (e) => {
      const catKey = categorySelect.value;
      const platKey = platformSelect.value;
      const bKey = e.target.value;
      profileSelect.innerHTML = '<option value="">Device...</option><option value="custom">Custom String...</option>';
      
      if (!bKey) {
        profileSelect.disabled = true;
        return;
      }
      
      profileSelect.disabled = false;
      const cat = typeof profilesStructured !== 'undefined' ? profilesStructured[catKey] : null;
      if (cat && cat.platforms && cat.platforms[platKey]) {
        let variants = cat.platforms[platKey].variants;
        if (bKey !== 'all') {
          variants = filterProfilesByBrowser(variants, bKey);
        }
        profileSelect.activeVariants = variants;
        variants.forEach((v, idx) => {
          const opt = document.createElement('option');
          opt.value = idx.toString();
          opt.textContent = v.name;
          profileSelect.appendChild(opt);
        });
      }
    });

    profileSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        customUaInput.style.display = 'block';
        customUaText.value = '';
        touchPointsInput.value = 0;
      } else if (val !== '') {
        customUaInput.style.display = 'none';
        const variants = profileSelect.activeVariants;
        if (variants && variants[parseInt(val)]) {
          const variant = variants[parseInt(val)];
          customUaText.value = variant.ua;
          touchPointsInput.value = variant.touchPoints || 0;
        }
      } else {
        customUaInput.style.display = 'none';
      }
    });

    function addOrUpdateRule() {
      const website = websiteUrlInput.value.trim();
      const customUA = customUaText.value.trim();
      const touchPoints = parseInt(touchPointsInput.value) || 0;

      if (!website) {
        showStatus('Please enter a website URL', 'error');
        return;
      }

      const userAgent = customUA;
      if (!userAgent) {
        showStatus('Please select a user agent or enter a custom one', 'error');
        return;
      }

      let geoCoords = null;
      if (geoSpoofRuleCheckbox.checked) {
        if (geoCoordsPresetSelect.value === 'custom') {
          geoCoords = {
            lat: parseFloat(geoLatRuleInput.value) || 40.7128,
            lng: parseFloat(geoLngRuleInput.value) || -74.0060
          };
        } else {
          const [lat, lng] = geoCoordsPresetSelect.value.split(',');
          geoCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
      }

      const rule = {
        id: editingRule ? editingRule.id : Date.now(),
        website: website,
        userAgent: userAgent,
        touchPoints: touchPoints,
        jsBlocked: jsBlockRuleCheckbox.checked,
        jsProtected: jsProtectRuleCheckbox.checked,
        mediaQuerySpoofEnabled: mediaQueryRuleCheckbox ? mediaQueryRuleCheckbox.checked : false,
        timingShieldEnabled: timingShieldRuleCheckbox ? timingShieldRuleCheckbox.checked : false,
        geoSpoofEnabled: geoSpoofRuleCheckbox.checked,
        geoCoords: geoCoords,
        created: editingRule ? editingRule.created : new Date().toISOString()
      };

      if (editingRule) {
        const index = websiteRules.findIndex(r => r.id === editingRule.id);
        websiteRules[index] = rule;
        editingRule = null;
        addRuleBtn.innerHTML = '<span class="icon">+</span> Add Rule';
      } else {
        // Check for duplicates
        if (websiteRules.some(r => r.website === website)) {
          showStatus('Rule for this website already exists', 'error');
          return;
        }
        websiteRules.push(rule);
      }

      websiteUrlInput.value = '';
      categorySelect.value = '';
      platformSelect.innerHTML = '<option value="">Platform...</option>';
      platformSelect.disabled = true;
      browserSelect.innerHTML = '<option value="">Browser...</option>';
      profileSelect.innerHTML = '<option value="">Device...</option>';
      browserSelect.disabled = true;
      profileSelect.disabled = true;
      customUaText.value = '';
      touchPointsInput.value = '0';
      jsBlockRuleCheckbox.checked = false;
      jsProtectRuleCheckbox.checked = false;
      if (mediaQueryRuleCheckbox) mediaQueryRuleCheckbox.checked = false;
      if (timingShieldRuleCheckbox) timingShieldRuleCheckbox.checked = false;
      geoSpoofRuleCheckbox.checked = false;
      geoCoordsPresetSelect.value = '40.7128,-74.0060';
      geoLatRuleInput.value = '';
      geoLngRuleInput.value = '';
      geoCoordsGroupDiv.style.display = 'none';
      geoCustomCoordsDiv.style.display = 'none';
      customUaInput.style.display = 'none';

      saveSettings();
      renderRules();
    }

    function editRule(rule) {
      console.log('Editing rule:', rule);
      editingRule = rule;
      websiteUrlInput.value = rule.website;
      touchPointsInput.value = rule.touchPoints || 0;
      jsBlockRuleCheckbox.checked = !!rule.jsBlocked;
      jsProtectRuleCheckbox.checked = !!rule.jsProtected;
      if (mediaQueryRuleCheckbox) mediaQueryRuleCheckbox.checked = !!rule.mediaQuerySpoofEnabled;
      if (timingShieldRuleCheckbox) timingShieldRuleCheckbox.checked = !!rule.timingShieldEnabled;
      
      geoSpoofRuleCheckbox.checked = !!rule.geoSpoofEnabled;
      geoCoordsGroupDiv.style.display = rule.geoSpoofEnabled ? 'block' : 'none';
      
      if (rule.geoSpoofEnabled && rule.geoCoords) {
        const presetVal = `${rule.geoCoords.lat},${rule.geoCoords.lng}`;
        const option = Array.from(geoCoordsPresetSelect.options).find(opt => opt.value === presetVal);
        if (option) {
          geoCoordsPresetSelect.value = presetVal;
          geoCustomCoordsDiv.style.display = 'none';
        } else {
          geoCoordsPresetSelect.value = 'custom';
          geoLatRuleInput.value = rule.geoCoords.lat;
          geoLngRuleInput.value = rule.geoCoords.lng;
          geoCustomCoordsDiv.style.display = 'block';
        }
      }

      categorySelect.value = '';
      platformSelect.innerHTML = '<option value="">Platform...</option>';
      platformSelect.disabled = true;
      browserSelect.innerHTML = '<option value="">Browser...</option>';
      profileSelect.innerHTML = '<option value="">Device...</option>';
      browserSelect.disabled = true;
      profileSelect.disabled = true;
      
      customUaText.value = rule.userAgent;
      customUaInput.style.display = 'block';

      addRuleBtn.innerHTML = '<span class="icon">✓</span> Update Rule';
      websiteUrlInput.focus();
    }

    function deleteRule(id) {
      console.log('Deleting rule with id:', id);
      if (confirm('Are you sure you want to delete this rule?')) {
        websiteRules = websiteRules.filter(r => r.id !== id);
        saveSettings();
        renderRules();
      }
    }

    function addBlock() {
      const website = blockUrlInput.value.trim();

      if (!website) {
        showStatus('Please enter a website URL', 'error');
        return;
      }

      if (editingBlock) {
        const index = blockList.findIndex(b => b.id === editingBlock.id);
        if (index !== -1) {
          blockList[index].website = website;
        }
        editingBlock = null;
        if (addBlockBtn) addBlockBtn.innerHTML = '<span class="icon">+</span> Add to Block List';
      } else {
        // Check for duplicates
        if (blockList.some(item => item.website === website)) {
          showStatus('Website already in block list', 'error');
          return;
        }

        const blockItem = {
          id: Date.now(),
          website: website,
          created: new Date().toISOString()
        };

        blockList.push(blockItem);
      }
      
      blockUrlInput.value = '';

      saveSettings();
      renderBlockList();
    }

    function editBlock(block) {
      editingBlock = block;
      blockUrlInput.value = block.website;
      if (addBlockBtn) addBlockBtn.innerHTML = '<span class="icon">✓</span> Update Block List';
      blockUrlInput.focus();
    }

    function deleteBlock(id) {
      if (confirm('Are you sure you want to remove this website from the block list?')) {
        blockList = blockList.filter(item => item.id !== id);
        saveSettings();
        renderBlockList();
      }
    }

    function addLocation() {
      const name = locNameInput.value.trim();
      const lat = parseFloat(locLatInput.value);
      const lng = parseFloat(locLngInput.value);

      if (!name) { showStatus('Please enter a location name', 'error'); return; }
      if (isNaN(lat) || lat < -90 || lat > 90) { showStatus('Invalid Latitude (-90 to 90)', 'error'); return; }
      if (isNaN(lng) || lng < -180 || lng > 180) { showStatus('Invalid Longitude (-180 to 180)', 'error'); return; }

      const location = {
        id: editingLocation ? editingLocation.id : Date.now(),
        name: name,
        lat: lat,
        lng: lng
      };

      if (editingLocation) {
        const index = customLocations.findIndex(l => l.id === editingLocation.id);
        if (index !== -1) {
          customLocations[index] = location;
        }
        editingLocation = null;
        if (addLocBtn) addLocBtn.innerHTML = '<span class="icon">+</span> Add Location';
      } else {
        customLocations.push(location);
      }
      
      locNameInput.value = '';
      locLatInput.value = '';
      locLngInput.value = '';

      saveSettings();
      renderLocations();
    }

    function editLocation(loc) {
      editingLocation = loc;
      locNameInput.value = loc.name;
      locLatInput.value = loc.lat;
      locLngInput.value = loc.lng;
      if (addLocBtn) addLocBtn.innerHTML = '<span class="icon">✓</span> Update Location';
      locNameInput.focus();
    }

    function deleteLocation(id) {
      if (confirm('Delete this custom location?')) {
        customLocations = customLocations.filter(loc => loc.id !== id);
        saveSettings();
        renderLocations();
      }
    }

    function renderLocations() {
      const geoCoordsPreset = document.getElementById('geoCoordsPreset');
      if (geoCoordsPreset) {
        // Remove old custom options
        const customOptions = geoCoordsPreset.querySelectorAll('option.custom-loc-option');
        customOptions.forEach(opt => opt.remove());
        
        // Add current custom locations before the "Custom Coordinates..." option if it existed, or at the end
        const customCoordsOption = geoCoordsPreset.querySelector('option[value="custom"]');
        
        customLocations.forEach(loc => {
          const option = document.createElement('option');
          option.value = `${loc.lat},${loc.lng}`;
          option.textContent = `${loc.name} (${loc.lat}, ${loc.lng})`;
          option.className = 'custom-loc-option';
          if (customCoordsOption) {
            geoCoordsPreset.insertBefore(option, customCoordsOption);
          } else {
            geoCoordsPreset.appendChild(option);
          }
        });
      }

      if (customLocations.length === 0) {
        customLocItems.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <p>No custom locations yet</p>
                <span>Add your own GPS coordinates here to use in the popup</span>
              </div>
            </div>
          </td>
        </tr>`;
        return;
      }

      customLocItems.innerHTML = customLocations.map(loc => `
      <tr>
        <td>${escapeHtml(loc.name)}</td>
        <td>${loc.lat}</td>
        <td>${loc.lng}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline edit-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-loc='${JSON.stringify(loc)}'>Edit</button>
            <button class="btn btn-danger-outline delete-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-loc-id="${loc.id}">Delete</button>
          </div>
        </td>
      </tr>
      `).join('');

      document.querySelectorAll('#customLocationsList .edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const loc = JSON.parse(e.target.getAttribute('data-loc'));
          editLocation(loc);
        });
      });

      document.querySelectorAll('#customLocationsList .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const locId = parseInt(e.target.getAttribute('data-loc-id'));
          deleteLocation(locId);
        });
      });
    }

    function renderRules() {
      if (websiteRules.length === 0) {
        rulesItems.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <p>No custom website rules yet</p>
                <span>Add rules to apply specific user agents to certain websites</span>
              </div>
            </div>
          </td>
        </tr>
      `;
        return;
      }

      rulesItems.innerHTML = websiteRules.map(rule => `
      <tr>
        <td>${escapeHtml(rule.website)}</td>
        <td style="font-size: 11px;">${escapeHtml(truncateUA(rule.userAgent))}</td>
        <td>${rule.touchPoints || 0}</td>
        <td>${rule.jsBlocked ? '&#10003; Yes' : 'No'}</td>
        <td>${rule.jsProtected ? '&#10003; Yes' : 'No'}</td>
        <td>${rule.geoSpoofEnabled ? '&#10003; Yes' : 'No'}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline edit-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-rule='${JSON.stringify(rule)}'>Edit</button>
            <button class="btn btn-danger-outline delete-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-rule-id="${rule.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

      // Add event listeners to buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const rule = JSON.parse(e.target.getAttribute('data-rule'));
          editRule(rule);
        });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ruleId = parseInt(e.target.getAttribute('data-rule-id'));
          deleteRule(ruleId);
        });
      });
    }

    function renderBlockList() {
      if (blockList.length === 0) {
        blockItems.innerHTML = `
        <tr>
          <td colspan="2">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <p>No blocked websites yet</p>
                <span>Add websites where user agent spoofing should be disabled</span>
              </div>
            </div>
          </td>
        </tr>
      `;
        return;
      }

      blockItems.innerHTML = blockList.map(item => `
      <tr>
        <td>${escapeHtml(item.website)}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-outline edit-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-block='${JSON.stringify(item)}'>Edit</button>
            <button class="btn btn-danger-outline delete-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-block-id="${item.id}">Remove</button>
          </div>
        </td>
      </tr>
    `).join('');

      document.querySelectorAll('.block-item .edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const block = JSON.parse(e.target.getAttribute('data-block'));
          editBlock(block);
        });
      });

      // Add event listeners to block delete buttons
      document.querySelectorAll('.block-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const blockId = parseInt(e.target.getAttribute('data-block-id'));
          deleteBlock(blockId);
        });
      });
    }

    function openExtensionDebug() {
      try {
        const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
        const debugUrl = isChrome ? 'chrome://extensions' : 'about:debugging#/runtime/this-firefox';
        // Open debugging page in a new tab
        browser.tabs.create({
          url: debugUrl
        });
        showStatus('Extension debugging page opened in new tab', 'success');
      } catch (error) {
        console.error('Failed to open debugging page:', error);
        showStatus('Failed to open debugging page', 'error');
      }
    }

    function exportSettings() {
      const browser = window.browser || window.chrome;
      const localKeys = [
        'selectedUA', 'uaSpoofEnabled', 'maxTouchPoints', 'touchSpoofEnabled', 
        'jsBlockEnabled', 'jsProtectEnabled', 'geoSpoofEnabled', 'geoPresetValue', 
        'geoCoords', 'activeCategory', 'uiState', 'theme'
      ];

      browser.storage.local.get(localKeys, (localResult) => {
        const settings = {
          websiteRules: websiteRules,
          blockList: blockList,
          customLocations: customLocations,
          globalSettings: localResult,
          exportedAt: new Date().toISOString(),
          version: '1.1'
        };

        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `morphagent-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus('Settings exported successfully!');
      });
    }

    function importSettings(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);

          if (settings.websiteRules && Array.isArray(settings.websiteRules)) {
            websiteRules = settings.websiteRules;
          }

          if (settings.blockList && Array.isArray(settings.blockList)) {
            blockList = settings.blockList;
          }

          if (settings.customLocations && Array.isArray(settings.customLocations)) {
            customLocations = settings.customLocations;
          }

          // Save sync settings
          saveSettings();

          // Save global local settings if present
          if (settings.globalSettings && typeof settings.globalSettings === 'object') {
            const browser = window.browser || window.chrome;
            browser.storage.local.set(settings.globalSettings, () => {
              // Notify background script to update badge/rules if needed
              browser.runtime.sendMessage({ type: 'set-settings', data: settings.globalSettings }).catch(() => {});
              
              // Apply theme locally if changed
              if (settings.globalSettings.theme) {
                applyTheme(settings.globalSettings.theme);
              }
              
              renderRules();
              renderBlockList();
              renderLocations();
              showStatus('Settings imported successfully!');
            });
          } else {
            renderRules();
            renderBlockList();
            renderLocations();
            showStatus('Settings imported successfully!');
          }
          
        } catch (error) {
          console.error(error);
          showStatus('Invalid settings file', 'error');
        }
      };
      reader.readAsText(file);

      // Clear the file input
      event.target.value = '';
    }

    function resetAllSettings() {
      if (confirm('Are you sure you want to reset all advanced settings? This action cannot be undone.')) {
        websiteRules = [];
        blockList = [];
        editingRule = null;

        // Clear forms
        websiteUrlInput.value = '';
        blockUrlInput.value = '';
        categorySelect.value = '';
        platformSelect.innerHTML = '<option value="">Platform...</option>';
        platformSelect.disabled = true;
        browserSelect.innerHTML = '<option value="">Browser...</option>';
        profileSelect.innerHTML = '<option value="">Device...</option>';
        browserSelect.disabled = true;
        profileSelect.disabled = true;
        customUaText.value = '';
        jsBlockRuleCheckbox.checked = false;
        jsProtectRuleCheckbox.checked = false;
        customUaInput.style.display = 'none';
        addRuleBtn.innerHTML = '<span class="icon">+</span> Add Rule';

        saveSettings();
        renderRules();
        renderBlockList();
        showStatus('All settings have been reset');
      }
    }

    // Tab-specific settings functions
  function loadTabSettings() {
    browser.runtime.sendMessage({ type: 'get-tab-settings' }).then((settings) => {
      tabSettings = settings || [];
      renderTabSettings();
    }).catch((error) => {
      console.error('Failed to load tab settings:', error);
      tabSettings = [];
      renderTabSettings();
    });
  }

  function renderTabSettings() {
    if (tabSettings.length === 0) {
      tabSettingsItems.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <p>No tab-specific settings found</p>
                <span>Apply settings to individual tabs from the main popup to see them here</span>
              </div>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    tabSettingsItems.innerHTML = tabSettings.map(tab => {
      let touchText = 'Default';
      if (tab.touchSpoofEnabled) touchText = tab.maxTouchPoints;
      
      return `
      <tr>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(tab.url)}">${escapeHtml(tab.url)}</td>
        <td style="font-size: 11px;">${tab.uaSpoofEnabled && tab.userAgent ? escapeHtml(truncateUA(tab.userAgent)) : 'Disabled'}</td>
        <td>${touchText}</td>
        <td>
          <button class="btn btn-danger-outline delete-tab-btn" style="height:24px;font-size:10px;padding:4px 8px;" data-tab-id="${tab.tabId}">Clear</button>
        </td>
      </tr>
      `;
    }).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.getAttribute('data-tab-id'));
        deleteTabSettings(tabId);
      });
    });
  }

  function copyTabSettings(tabId) {
    const tab = tabSettings.find(t => t.tabId === tabId);
    if (!tab) return;

    const settingsText = `User Agent: ${tab.userAgent}\nTouch Points: ${tab.touchPoints || 0}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(settingsText).then(() => {
        showStatus('Tab settings copied to clipboard', 'success');
      }).catch(() => {
        fallbackCopyText(settingsText);
      });
    } else {
      fallbackCopyText(settingsText);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showStatus('Tab settings copied to clipboard', 'success');
    } catch (err) {
      showStatus('Failed to copy settings', 'error');
    }
    document.body.removeChild(textArea);
  }

  function deleteTabSettings(tabId) {
    if (confirm('Are you sure you want to remove settings for this tab?')) {
      browser.runtime.sendMessage({
        type: 'delete-tab-settings',
        tabId: tabId
      }).then(() => {
        showStatus('Tab settings removed', 'success');
        loadTabSettings();
      }).catch((error) => {
        console.error('Failed to delete tab settings:', error);
        showStatus('Failed to remove tab settings', 'error');
      });
    }
  }

  function clearAllTabSettings() {
    if (confirm('Are you sure you want to clear all tab-specific settings? This action cannot be undone.')) {
      browser.runtime.sendMessage({ type: 'clear-all-tab-settings' }).then(() => {
        showStatus('All tab settings cleared', 'success');
        loadTabSettings();
      }).catch((error) => {
        console.error('Failed to clear tab settings:', error);
        showStatus('Failed to clear tab settings', 'error');
      });
    }
  }

    function showStatus(message, type = 'success') {
      statusText.textContent = message;
      statusMessage.className = `status-message ${type}`;
      statusMessage.style.display = 'block';

      // Trigger animation
      setTimeout(() => {
        statusMessage.classList.add('show');
      }, 10);

      // Hide after 3 seconds
      setTimeout(() => {
        statusMessage.classList.remove('show');
        setTimeout(() => {
          statusMessage.style.display = 'none';
        }, 300);
      }, 3000);
    }

    function truncateUA(ua) {
      return ua.length > 80 ? ua.substring(0, 80) + '...' : ua;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Make functions globally available for inline event handlers
    window.editRule = editRule;
    window.deleteRule = deleteRule;
    window.deleteBlock = deleteBlock;
  });