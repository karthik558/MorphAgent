document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeToggle = document.getElementById('themeToggle');
  const closeBtn = document.getElementById('closeBtn');
  const addRuleBtn = document.getElementById('addRuleBtn');
  // Elements
  const addBlockBtn = document.getElementById('addBlockBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const debugBtn = document.getElementById('debugBtn');
  const resetAllBtn = document.getElementById('resetAllBtn');
  const importFile = document.getElementById('importFile');

  const websiteUrlInput = document.getElementById('websiteUrl');
  const customUserAgentSelect = document.getElementById('customUserAgent');
  const customUaInput = document.getElementById('customUaInput');
  const customUaText = document.getElementById('customUaText');
  const touchPointsInput = document.getElementById('touchPoints');
  const blockUrlInput = document.getElementById('blockUrl');

  const rulesItems = document.getElementById('rulesItems');
  const blockItems = document.getElementById('blockItems');
  const statusMessage = document.getElementById('statusMessage');
  const statusText = document.getElementById('statusText');

  // Tab-specific settings elements
  const refreshTabsBtn = document.getElementById('refreshTabsBtn');
  const clearAllTabsBtn = document.getElementById('clearAllTabsBtn');
  const tabSettingsItems = document.getElementById('tabSettingsItems');

  // State
  let websiteRules = [];
  let blockList = [];
  let editingRule = null;

  // Tab-specific state
  let tabSettings = [];

  // Initialize
  init();

  function init() {
    loadSettings();
    setupTheme();
    populateUserAgentOptions();
    renderRules();
    renderBlockList();
    setupEventListeners();
    loadTabSettings();
  }

  function renderBlockList() {
    if (blockList.length === 0) {
      blockItems.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
          </svg>
          <p>No blocked websites yet</p>
          <small>Add websites where user agent spoofing should be disabled</small>
        </div>
      `;
      return;
    }

    blockItems.innerHTML = blockList.map(item => `
      <div class="block-item" data-block-id="${item.id}">
        <div class="item-website">${escapeHtml(item.website)}</div>
        <div class="item-actions">
          <button class="delete-btn" data-block-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

    // Add event listeners to block delete buttons
    document.querySelectorAll('.block-item .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const blockId = parseInt(e.target.getAttribute('data-block-id'));
        deleteBlock(blockId);
      });
    });
  }

    function setupEventListeners() {
      // Theme toggle
      themeToggle.addEventListener('click', toggleTheme);

      // Close button
      closeBtn.addEventListener('click', () => {
        window.close();
      });

      // Custom UA select change
      customUserAgentSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          customUaInput.style.display = 'block';
        } else {
          customUaInput.style.display = 'none';
        }
      });

      // Add rule
      addRuleBtn.addEventListener('click', addOrUpdateRule);

      // Add block
      addBlockBtn.addEventListener('click', addBlock);

      // Import/Export
      exportBtn.addEventListener('click', exportSettings);
      importBtn.addEventListener('click', () => importFile.click());
      debugBtn.addEventListener('click', openFirefoxDebug);
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
          }
          if (changes.blockList) {
            blockList = changes.blockList.newValue || [];
            renderBlockList();
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
      browser.storage.sync.get(['websiteRules', 'blockList'], (result) => {
        websiteRules = result.websiteRules || [];
        blockList = result.blockList || [];
        renderRules();
        renderBlockList();
      });
    }

    function saveSettings() {
      const browser = window.browser || window.chrome;
      browser.storage.sync.set({
        websiteRules: websiteRules,
        blockList: blockList
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

    function populateUserAgentOptions() {
      // Clear existing options except first two
      while (customUserAgentSelect.children.length > 2) {
        customUserAgentSelect.removeChild(customUserAgentSelect.lastChild);
      }

      // Add profiles from profiles.js
      if (typeof profilesStructured !== 'undefined') {
        Object.entries(profilesStructured).forEach(([categoryKey, category]) => {
          Object.entries(category.platforms).forEach(([platformKey, platform]) => {
            platform.variants.forEach((variant) => {
              const option = document.createElement('option');
              option.value = variant.ua;
              option.textContent = `${category.name} - ${variant.name}`;
              customUserAgentSelect.appendChild(option);
            });
          });
        });
      }
    }

    function addOrUpdateRule() {
      const website = websiteUrlInput.value.trim();
      const selectedUA = customUserAgentSelect.value;
      const customUA = customUaText.value.trim();
      const touchPoints = parseInt(touchPointsInput.value) || 0;

      if (!website) {
        showStatus('Please enter a website URL', 'error');
        return;
      }

      let userAgent = '';
      if (selectedUA === 'custom') {
        if (!customUA) {
          showStatus('Please enter a custom user agent', 'error');
          return;
        }
        userAgent = customUA;
      } else if (selectedUA) {
        userAgent = selectedUA;
      } else {
        showStatus('Please select a user agent', 'error');
        return;
      }

      const rule = {
        id: editingRule ? editingRule.id : Date.now(),
        website: website,
        userAgent: userAgent,
        touchPoints: touchPoints,
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

      // Clear form
      websiteUrlInput.value = '';
      customUserAgentSelect.value = '';
      customUaText.value = '';
      touchPointsInput.value = '0';
      customUaInput.style.display = 'none';

      saveSettings();
      renderRules();
    }

    function editRule(rule) {
      console.log('Editing rule:', rule);
      editingRule = rule;
      websiteUrlInput.value = rule.website;
      touchPointsInput.value = rule.touchPoints || 0;

      // Try to find the UA in the select options
      const option = Array.from(customUserAgentSelect.options).find(opt => opt.value === rule.userAgent);
      if (option) {
        customUserAgentSelect.value = rule.userAgent;
        customUaInput.style.display = 'none';
      } else {
        customUserAgentSelect.value = 'custom';
        customUaText.value = rule.userAgent;
        customUaInput.style.display = 'block';
      }

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
      blockUrlInput.value = '';

      saveSettings();
      renderBlockList();
    }

    function deleteBlock(id) {
      console.log('Deleting block with id:', id);
      if (confirm('Are you sure you want to remove this website from the block list?')) {
        blockList = blockList.filter(item => item.id !== id);
        saveSettings();
        renderBlockList();
      }
    }

    function renderRules() {
      if (websiteRules.length === 0) {
        rulesItems.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <p>No custom website rules yet</p>
          <small>Add rules to apply specific user agents to certain websites</small>
        </div>
      `;
        return;
      }

      rulesItems.innerHTML = websiteRules.map(rule => `
      <div class="rule-item" data-rule-id="${rule.id}">
        <div class="item-website">${escapeHtml(rule.website)}</div>
        <div class="item-ua">${escapeHtml(truncateUA(rule.userAgent))}</div>
        <div class="item-touch">${rule.touchPoints || 0}</div>
        <div class="item-actions">
          <button class="edit-btn" data-rule='${JSON.stringify(rule)}'>Edit</button>
          <button class="delete-btn" data-rule-id="${rule.id}">Delete</button>
        </div>
      </div>
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
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
          </svg>
          <p>No blocked websites yet</p>
          <small>Add websites where user agent spoofing should be disabled</small>
        </div>
      `;
        return;
      }

      blockItems.innerHTML = blockList.map(item => `
      <div class="block-item" data-block-id="${item.id}">
        <div class="item-website">${escapeHtml(item.website)}</div>
        <div class="item-actions">
          <button class="delete-btn" data-block-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

      // Add event listeners to block delete buttons
      document.querySelectorAll('.block-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const blockId = parseInt(e.target.getAttribute('data-block-id'));
          deleteBlock(blockId);
        });
      });
    }

    function openFirefoxDebug() {
      try {
        // Open Firefox debugging page in a new tab
        browser.tabs.create({
          url: 'about:debugging#/runtime/this-firefox'
        });
        showStatus('Firefox debugging page opened in new tab', 'success');
      } catch (error) {
        console.error('Failed to open Firefox debugging page:', error);
        showStatus('Failed to open debugging page', 'error');
      }
    }

    function exportSettings() {
      const settings = {
        websiteRules: websiteRules,
        blockList: blockList,
        exportedAt: new Date().toISOString(),
        version: '1.0'
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

          saveSettings();
          renderRules();
          renderBlockList();
          showStatus('Settings imported successfully!');
        } catch (error) {
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
        customUserAgentSelect.value = '';
        customUaText.value = '';
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
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
            <path d="M14,2A8,8 0 0,1 22,10A8,8 0 0,1 14,18A8,8 0 0,1 6,10A8,8 0 0,1 14,2M14,4A6,6 0 0,0 8,10A6,6 0 0,0 14,16A6,6 0 0,0 20,10A6,6 0 0,0 14,4Z"/>
          </svg>
          <p>No tab-specific settings found</p>
          <small>Apply settings to individual tabs from the main popup to see them here</small>
        </div>
      `;
      return;
    }

    tabSettingsItems.innerHTML = tabSettings.map(tab => `
      <div class="rule-item" data-tab-id="${tab.tabId}">
        <div class="item-website">
          <div class="website-url">${escapeHtml(tab.url)}</div>
          <div class="website-title">${escapeHtml(tab.title || 'Untitled')}</div>
        </div>
        <div class="item-ua">${escapeHtml(tab.userAgent).substring(0, 60)}${tab.userAgent.length > 60 ? '...' : ''}</div>
        <div class="item-touch">${tab.touchPoints || 0}</div>
        <div class="item-actions">
          <button class="copy-btn" data-tab-id="${tab.tabId}" title="Copy settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </button>
          <button class="delete-btn" data-tab-id="${tab.tabId}" title="Remove tab settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.rule-item .copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.closest('button').getAttribute('data-tab-id'));
        copyTabSettings(tabId);
      });
    });

    document.querySelectorAll('.rule-item .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.closest('button').getAttribute('data-tab-id'));
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