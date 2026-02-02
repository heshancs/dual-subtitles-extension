// popup.js - Settings management

// Load saved settings
chrome.storage.sync.get({
  service: 'free',
  apiKey: '',
  userEmail: '',
  sinhalaSize: 120,
  englishSize: 100,
  sinhalaPosition: 10
}, (items) => {
  // Set radio button
  document.querySelector(`input[name="service"][value="${items.service}"]`).checked = true;

  // Show/hide API key field
  if (items.service === 'google') {
    document.getElementById('googleApiKey').style.display = 'block';
  }

  // Set API key
  document.getElementById('apiKey').value = items.apiKey;

  // Set user email
  document.getElementById('userEmail').value = items.userEmail;

  // Set range values
  document.getElementById('sinhalaSizeRange').value = items.sinhalaSize;
  document.getElementById('englishSizeRange').value = items.englishSize;
  document.getElementById('sinhalaPositionRange').value = items.sinhalaPosition;

  // Update display
  updateDisplayValues();
});

// Handle radio button change
document.querySelectorAll('input[name="service"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const googleApiKey = document.getElementById('googleApiKey');
    if (e.target.value === 'google') {
      googleApiKey.style.display = 'block';
    } else {
      googleApiKey.style.display = 'none';
    }
  });
});

// Update display values for ranges
function updateDisplayValues() {
  document.getElementById('sinhalaSize').textContent =
    document.getElementById('sinhalaSizeRange').value + '%';
  document.getElementById('englishSize').textContent =
    document.getElementById('englishSizeRange').value + '%';
  document.getElementById('sinhalaPosition').textContent =
    document.getElementById('sinhalaPositionRange').value + '%';
}

// Range input listeners
document.getElementById('sinhalaSizeRange').addEventListener('input', updateDisplayValues);
document.getElementById('englishSizeRange').addEventListener('input', updateDisplayValues);
document.getElementById('sinhalaPositionRange').addEventListener('input', updateDisplayValues);

// Save settings
document.getElementById('saveBtn').addEventListener('click', () => {
  const service = document.querySelector('input[name="service"]:checked').value;
  const apiKey = document.getElementById('apiKey').value;
  const userEmail = document.getElementById('userEmail').value.trim();
  const sinhalaSize = parseInt(document.getElementById('sinhalaSizeRange').value);
  const englishSize = parseInt(document.getElementById('englishSizeRange').value);
  const sinhalaPosition = parseInt(document.getElementById('sinhalaPositionRange').value);

  // Validate Google API key if selected
  if (service === 'google' && !apiKey) {
    showStatus('Please enter your Google Translate API key', 'error');
    return;
  }

  // Save to Chrome storage
  chrome.storage.sync.set({
    service,
    apiKey,
    userEmail,
    sinhalaSize,
    englishSize,
    sinhalaPosition
  }, () => {
    showStatus('Settings saved successfully! ✓', 'success');

    // Notify content scripts to reload settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated' }).catch(() => {
          // Content script not loaded on this page - that's okay
          console.log('Content script not active on this tab');
        });
      }
    });
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      status.className = 'status';
    }, 3000);
  }
}

// Quota tracking for Google Translate
const GOOGLE_MONTHLY_LIMIT = 500000; // 500,000 chars/month
let dailyLimit = 16666; // Default ~500k/30 days

// Load and display quota usage
function loadQuotaUsage() {
  chrome.storage.local.get({
    googleMonthlyChars: 0,
    googleDailyChars: 0,
    quotaResetMonth: new Date().getMonth(),
    quotaResetDay: new Date().getDate(),
    dailyLimit: 16666
  }, (data) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Reset if new month
    if (data.quotaResetMonth !== currentMonth) {
      data.googleMonthlyChars = 0;
      data.googleDailyChars = 0;
      chrome.storage.local.set({
        googleMonthlyChars: 0,
        googleDailyChars: 0,
        quotaResetMonth: currentMonth,
        quotaResetDay: currentDay
      });
    }
    // Reset daily if new day
    else if (data.quotaResetDay !== currentDay) {
      data.googleDailyChars = 0;
      chrome.storage.local.set({
        googleDailyChars: 0,
        quotaResetDay: currentDay
      });
    }

    dailyLimit = data.dailyLimit;

    // Update daily limit slider
    const dailyLimitRange = document.getElementById('dailyLimitRange');
    const dailyLimitDisplay = document.getElementById('dailyLimitDisplay');
    if (dailyLimitRange) {
      dailyLimitRange.value = data.dailyLimit;
    }
    if (dailyLimitDisplay) {
      dailyLimitDisplay.textContent = data.dailyLimit.toLocaleString();
    }

    updateQuotaDisplay(data.googleMonthlyChars, data.googleDailyChars);
  });
}

// Update both progress bars
function updateQuotaDisplay(monthlyChars, dailyChars) {
  // Monthly progress
  const monthlyPercent = Math.min((monthlyChars / GOOGLE_MONTHLY_LIMIT) * 100, 100);
  const monthlyText = document.getElementById('monthlyQuotaText');
  const monthlyPercentEl = document.getElementById('monthlyQuotaPercent');
  const monthlyBar = document.getElementById('monthlyQuotaBar');

  if (monthlyText) {
    monthlyText.textContent = `${monthlyChars.toLocaleString()} / ${GOOGLE_MONTHLY_LIMIT.toLocaleString()}`;
  }
  if (monthlyPercentEl) {
    monthlyPercentEl.textContent = `${monthlyPercent.toFixed(1)}%`;
  }
  if (monthlyBar) {
    monthlyBar.style.width = `${monthlyPercent}%`;
    // Color based on usage
    if (monthlyPercent >= 90) {
      monthlyBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (monthlyPercent >= 70) {
      monthlyBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
      monthlyBar.style.background = 'linear-gradient(90deg, #4ade80, #22c55e)';
    }
  }

  // Daily progress
  const dailyPercent = Math.min((dailyChars / dailyLimit) * 100, 100);
  const dailyText = document.getElementById('dailyQuotaText');
  const dailyPercentEl = document.getElementById('dailyQuotaPercent');
  const dailyBar = document.getElementById('dailyQuotaBar');

  if (dailyText) {
    dailyText.textContent = `${dailyChars.toLocaleString()} / ${dailyLimit.toLocaleString()}`;
  }
  if (dailyPercentEl) {
    dailyPercentEl.textContent = `${dailyPercent.toFixed(1)}%`;
  }
  if (dailyBar) {
    dailyBar.style.width = `${dailyPercent}%`;
    // Color based on usage
    if (dailyPercent >= 90) {
      dailyBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (dailyPercent >= 70) {
      dailyBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
      dailyBar.style.background = 'linear-gradient(90deg, #60a5fa, #3b82f6)';
    }
  }
}

// Daily limit slider
document.getElementById('dailyLimitRange')?.addEventListener('input', (e) => {
  const value = parseInt(e.target.value);
  dailyLimit = value;
  document.getElementById('dailyLimitDisplay').textContent = value.toLocaleString();
  chrome.storage.local.set({ dailyLimit: value });
  // Refresh display with new limit
  chrome.storage.local.get({ googleDailyChars: 0, googleMonthlyChars: 0 }, (data) => {
    updateQuotaDisplay(data.googleMonthlyChars, data.googleDailyChars);
  });
});

// Reset quota counters
document.getElementById('resetQuotaBtn')?.addEventListener('click', () => {
  const now = new Date();
  chrome.storage.local.set({
    googleMonthlyChars: 0,
    googleDailyChars: 0,
    quotaResetMonth: now.getMonth(),
    quotaResetDay: now.getDate()
  }, () => {
    updateQuotaDisplay(0, 0);
    showStatus('Counters reset! ✓', 'success');
  });
});

// Load quota on popup open
loadQuotaUsage();
