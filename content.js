// content.js - Main subtitle capture and translation logic

let settings = {
  service: 'free',
  apiKey: '',
  userEmail: '',
  sinhalaSize: 120,
  englishSize: 100,
  sinhalaPosition: 10
};

let translationCache = new Map();
let currentEnglishText = '';
let sinhalaOverlay = null;
let translationTimeout = null;

// Rate limiting protection
let lastRequestTime = 0;
let isRateLimited = false;
let rateLimitedUntil = 0;
const MIN_REQUEST_INTERVAL = 1500; // Minimum 1.5 seconds between requests
const RATE_LIMIT_COOLDOWN = 60000; // Wait 60 seconds after hitting rate limit
let pendingTranslation = null; // Queue for pending translation

// Pause-based translation mode
let isVideoPaused = false;
let videoElement = null;
let lastSubtitleText = ''; // Store the last subtitle for when paused

// Google quota fallback
let googleQuotaExceeded = false;

// Load settings
function loadSettings() {
  chrome.storage.sync.get({
    service: 'free',
    apiKey: '',
    userEmail: '',
    sinhalaSize: 120,
    englishSize: 100,
    sinhalaPosition: 10
  }, (items) => {
    settings = items;
    updateSinhalaOverlayStyle();
  });
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    loadSettings();
  }
});

// Initialize
loadSettings();

// Create Sinhala subtitle overlay
function createSinhalaOverlay(targetContainer = null) {
  if (sinhalaOverlay && document.body.contains(sinhalaOverlay)) {
    return sinhalaOverlay;
  }

  // Remove old overlay if it exists but not in DOM
  if (sinhalaOverlay) {
    try {
      sinhalaOverlay.remove();
    } catch (e) { }
  }

  sinhalaOverlay = document.createElement('div');
  sinhalaOverlay.id = 'dual-subtitles-sinhala';
  sinhalaOverlay.className = 'dual-subtitles-overlay';

  // Use specified container, or find the best one
  let container = targetContainer;

  if (!container) {
    // Check if we're in fullscreen mode first
    const fullscreenElement = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (fullscreenElement) {
      container = fullscreenElement;
    } else {
      // Try to find video container
      container = document.querySelector('.watch-video, #movie_player, .html5-video-player, .player-video-wrapper');
    }
  }

  if (container) {
    container.appendChild(sinhalaOverlay);
  } else {
    // Fallback to body if container not found
    document.body.appendChild(sinhalaOverlay);
  }

  updateSinhalaOverlayStyle();
  return sinhalaOverlay;
}

function updateSinhalaOverlayStyle() {
  if (!sinhalaOverlay) return;

  sinhalaOverlay.style.top = `${settings.sinhalaPosition}%`;

  // Calculate font size: base is 2.8vw, multiply by user's percentage
  const baseSizeVw = 2.8;
  const multiplier = settings.sinhalaSize / 100;
  sinhalaOverlay.style.fontSize = `${baseSizeVw * multiplier}vw`;

  // Force visibility and positioning
  sinhalaOverlay.style.display = 'block';
  sinhalaOverlay.style.position = 'fixed';
  sinhalaOverlay.style.zIndex = '2147483647';
}

// Translation functions
async function translateText(text) {
  // Check cache first
  if (translationCache.has(text)) {
    return translationCache.get(text);
  }

  // Check if we're rate limited
  const now = Date.now();
  if (isRateLimited && now < rateLimitedUntil) {
    console.log(`Rate limited, waiting ${Math.round((rateLimitedUntil - now) / 1000)}s...`);
    // Return last cached translation or indicate waiting
    return findSimilarCached(text) || '⏳ පරිවර්තනය රැඳී සිටී...';
  }

  // Reset rate limit if cooldown passed
  if (isRateLimited && now >= rateLimitedUntil) {
    isRateLimited = false;
    console.log('Rate limit cooldown ended, resuming translations');
  }

  // Throttle requests - ensure minimum interval between API calls
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();

  try {
    let translation;

    if (settings.service === 'google' && settings.apiKey && !googleQuotaExceeded) {
      try {
        translation = await translateWithGoogle(text);
      } catch (googleError) {
        // Check if quota exceeded (403 or 429)
        if (googleError.message && (googleError.message.includes('403') || googleError.message.includes('429') || googleError.message.includes('quota'))) {
          console.log('Google quota exceeded, switching to free service');
          googleQuotaExceeded = true;
          showQuotaAlert();
          // Fallback to free service
          translation = await translateWithMyMemory(text);
        } else {
          throw googleError;
        }
      }
    } else {
      // Use MyMemory as primary free service
      translation = await translateWithMyMemory(text);
    }

    // Cache the result
    translationCache.set(text, translation);

    // Increased cache size to reduce API calls
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Check if it's a rate limit error
    if (error.message && error.message.includes('429')) {
      handleRateLimit();
      return findSimilarCached(text) || '⏳ API සීමාව, රැඳී සිටින්න...';
    }
    return text; // Return original if translation fails
  }
}

// Handle rate limit by setting cooldown
function handleRateLimit() {
  isRateLimited = true;
  rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN;
  console.log(`Rate limited! Waiting ${RATE_LIMIT_COOLDOWN / 1000} seconds before retrying...`);
}

// Find a similar cached translation (helps during rate limiting)
function findSimilarCached(text) {
  // Try to find a cached translation for similar text
  for (const [key, value] of translationCache) {
    if (text.includes(key) || key.includes(text)) {
      return value;
    }
  }
  return null;
}

// Show alert when Google quota is exceeded
function showQuotaAlert() {
  // Create alert overlay
  const alertDiv = document.createElement('div');
  alertDiv.id = 'quota-alert';
  alertDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      animation: fadeIn 0.3s ease;
    ">
      <div style="font-size: 24px; margin-bottom: 10px;">⚠️ Google Translate Quota Exceeded</div>
      <div style="opacity: 0.9;">Switching to free MyMemory service...</div>
      <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">Translation will continue automatically</div>
    </div>
  `;

  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(alertDiv);

  // Remove after 4 seconds
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.5s ease';
    setTimeout(() => alertDiv.remove(), 500);
  }, 4000);

  console.log('Google quota exceeded - switched to MyMemory free service');
}

async function translateWithGoogle(text) {
  if (!settings.apiKey) {
    throw new Error('Google API key not set');
  }

  const url = 'https://translation.googleapis.com/language/translate/v2';
  const params = new URLSearchParams({
    q: text,
    target: 'si',
    source: 'en',
    key: settings.apiKey
  });

  const response = await fetch(`${url}?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.status}`);
  }

  const data = await response.json();

  // Track character usage for quota
  trackGoogleUsage(text.length);

  return data.data.translations[0].translatedText;
}

// Track Google Translate character usage (both monthly and daily)
function trackGoogleUsage(charCount) {
  chrome.storage.local.get({
    googleMonthlyChars: 0,
    googleDailyChars: 0,
    quotaResetMonth: new Date().getMonth(),
    quotaResetDay: new Date().getDate()
  }, (data) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    let monthlyChars = data.googleMonthlyChars;
    let dailyChars = data.googleDailyChars;

    // Reset if new month
    if (data.quotaResetMonth !== currentMonth) {
      monthlyChars = 0;
      dailyChars = 0;
    }
    // Reset daily if new day
    else if (data.quotaResetDay !== currentDay) {
      dailyChars = 0;
    }

    // Add new characters
    monthlyChars += charCount;
    dailyChars += charCount;

    chrome.storage.local.set({
      googleMonthlyChars: monthlyChars,
      googleDailyChars: dailyChars,
      quotaResetMonth: currentMonth,
      quotaResetDay: currentDay
    });

    console.log(`Google usage - Today: ${dailyChars.toLocaleString()} | Month: ${monthlyChars.toLocaleString()} / 500,000`);
  });
}

// Primary free translation service - MyMemory (more reliable)
async function translateWithMyMemory(text) {
  // MyMemory has a 500 character limit per request
  if (text.length > 500) {
    text = text.substring(0, 500);
  }

  // Build URL with optional email for 10x more requests
  let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`;

  // Add email if provided (increases limit from 1,000 to 10,000 requests/day)
  if (settings.userEmail) {
    url += `&de=${encodeURIComponent(settings.userEmail)}`;
    console.log('Using MyMemory with email for increased limits');
  }

  const response = await fetch(url);

  // Handle rate limiting
  if (response.status === 429) {
    handleRateLimit();
    throw new Error('MyMemory error: 429 - Rate limited');
  }

  if (!response.ok) {
    throw new Error(`MyMemory error: ${response.status}`);
  }

  const data = await response.json();

  if (data.responseStatus === 429) {
    handleRateLimit();
    throw new Error('MyMemory error: 429 - Rate limited');
  }

  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory API error: ${data.responseStatus}`);
  }

  const translation = data.responseData.translatedText;

  // Verify we got Sinhala text (contains Sinhala characters)
  const hasSinhala = /[\u0D80-\u0DFF]/.test(translation);

  if (!hasSinhala) {
    console.warn('MyMemory did not return Sinhala text');
    // Return original text with indicator instead of making another API call
    return text;
  }

  return translation;
}

// Display Sinhala subtitle
function displaySinhalaSubtitle(text) {
  const overlay = createSinhalaOverlay();

  if (text) {
    overlay.textContent = text;
    overlay.style.display = 'block';
  } else {
    overlay.style.display = 'none';
  }
}

// Debounced translation to prevent duplicates
function translateAndDisplay(text) {
  // Clear any pending translation
  if (translationTimeout) {
    clearTimeout(translationTimeout);
  }

  // Always store the latest subtitle text
  if (text) {
    lastSubtitleText = text;
  }

  // Only translate when video is paused
  if (!isVideoPaused) {
    // Hide translation when playing
    displaySinhalaSubtitle('');
    return;
  }

  // Wait a bit to see if more text comes in
  translationTimeout = setTimeout(() => {
    const textToTranslate = text || lastSubtitleText;

    if (textToTranslate && textToTranslate !== currentEnglishText) {
      currentEnglishText = textToTranslate;
      console.log('Processing subtitle (paused):', textToTranslate.substring(0, 50) + (textToTranslate.length > 50 ? '...' : ''));

      translateText(textToTranslate).then(translation => {
        // Only display if still paused
        if (isVideoPaused) {
          console.log('Translation result:', translation.substring(0, 50) + (translation.length > 50 ? '...' : ''));
          displaySinhalaSubtitle(translation);
        }
      }).catch(error => {
        console.error('Translation failed:', error);
      });
    } else if (!textToTranslate && currentEnglishText) {
      currentEnglishText = '';
      displaySinhalaSubtitle('');
    }
  }, 100); // Wait 100ms for subtitle to stabilize
}

// Handle video pause/play events
function setupVideoListeners() {
  // Find video element
  videoElement = document.querySelector('video');

  if (!videoElement) {
    console.log('Video element not found, retrying...');
    setTimeout(setupVideoListeners, 1000);
    return;
  }

  console.log('Video element found, setting up pause listeners');

  // Initial state
  isVideoPaused = videoElement.paused;

  // Listen for pause
  videoElement.addEventListener('pause', () => {
    console.log('Video paused - showing translation');
    isVideoPaused = true;

    // Translate the current or last subtitle
    if (lastSubtitleText) {
      translateAndDisplay(lastSubtitleText);
    }
  });

  // Listen for play
  videoElement.addEventListener('play', () => {
    console.log('Video playing - hiding translation');
    isVideoPaused = false;
    displaySinhalaSubtitle('');
    currentEnglishText = ''; // Reset so next pause retranslates
  });
}

// Netflix subtitle detection
function detectNetflixSubtitles() {
  console.log('Setting up Netflix subtitle detection...');

  const observer = new MutationObserver((mutations) => {
    // Try multiple selectors for Netflix subtitles
    const selectors = [
      '.player-timedtext-text-container',
      '.player-timedtext',
      '[class*="timedtext"]',
      '.ltr-1wkxifj',
      '.ltr-1eu60gn'
    ];

    let subtitleContainer = null;
    for (const selector of selectors) {
      subtitleContainer = document.querySelector(selector);
      if (subtitleContainer) break;
    }

    if (subtitleContainer) {
      // Get all text from the container
      const newText = subtitleContainer.textContent.trim();
      translateAndDisplay(newText);
    }
  });

  // Observe the entire body for Netflix's dynamic subtitles
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  console.log('Netflix observer started');
}

// YouTube subtitle detection
function detectYouTubeSubtitles() {
  console.log('Setting up YouTube subtitle detection...');

  const observer = new MutationObserver((mutations) => {
    // Try multiple YouTube subtitle selectors
    const selectors = [
      '.ytp-caption-window-container',
      '.caption-window',
      '.captions-text',
      '[class*="caption"]'
    ];

    let captionWindow = null;
    for (const selector of selectors) {
      captionWindow = document.querySelector(selector);
      if (captionWindow) break;
    }

    if (captionWindow) {
      // Try to get caption segments
      const segments = captionWindow.querySelectorAll('.ytp-caption-segment, .caption-visual-line, [class*="caption-segment"]');

      if (segments.length > 0) {
        const newText = Array.from(segments)
          .map(seg => seg.textContent)
          .join(' ')
          .trim();

        translateAndDisplay(newText);
      } else {
        // Try getting text directly from caption window
        const newText = captionWindow.textContent.trim();
        translateAndDisplay(newText);
      }
    }
  });

  // Observe the video player
  const videoPlayer = document.querySelector('#movie_player, .html5-video-player');
  if (videoPlayer) {
    observer.observe(videoPlayer, {
      childList: true,
      subtree: true,
      characterData: true
    });
    console.log('YouTube observer started');
  } else {
    // Retry if player not found yet
    setTimeout(detectYouTubeSubtitles, 1000);
  }
}

// Detect which platform we're on and start subtitle detection
function init() {
  const hostname = window.location.hostname;

  console.log('Dual Subtitles Extension: Initializing on', hostname);
  console.log('Mode: Pause-to-translate (pause video to see Sinhala subtitles)');

  if (hostname.includes('netflix.com')) {
    console.log('Dual Subtitles: Netflix detected');
    detectNetflixSubtitles();
    setupVideoListeners();
    setupFullscreenListener();
  } else if (hostname.includes('youtube.com')) {
    console.log('Dual Subtitles: YouTube detected');
    detectYouTubeSubtitles();
    setupVideoListeners();
    setupFullscreenListener();
  } else {
    console.log('Dual Subtitles: Unsupported platform');
  }
}

// Setup fullscreen change listener
function setupFullscreenListener() {
  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

function handleFullscreenChange() {
  const fullscreenElement = document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  const isFullscreen = !!fullscreenElement;

  console.log('Fullscreen changed:', isFullscreen, fullscreenElement?.className || 'none');

  // Always recreate overlay when fullscreen state changes
  // Remove old overlay
  if (sinhalaOverlay) {
    try {
      sinhalaOverlay.remove();
    } catch (e) { }
    sinhalaOverlay = null;
  }

  // Create new overlay attached to the correct container
  setTimeout(() => {
    // For fullscreen, attach directly to the fullscreen element
    // For non-fullscreen, let createSinhalaOverlay find the best container
    createSinhalaOverlay(isFullscreen ? fullscreenElement : null);

    // Restore current subtitle if any
    if (currentEnglishText) {
      translateText(currentEnglishText).then(translation => {
        displaySinhalaSubtitle(translation);
      });
    }
  }, 150); // Slightly longer delay for Netflix's animations
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also try after delays in case the player loads later
setTimeout(init, 2000);
setTimeout(init, 5000);
setTimeout(init, 10000);

// Listen for URL changes (for single-page apps like YouTube)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, reinitializing...');
    setTimeout(init, 1000);
  }
}).observe(document, { subtree: true, childList: true });
