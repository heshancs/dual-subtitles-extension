// background.js - Service worker for the extension

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Dual Subtitles Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    service: 'free',
    apiKey: '',
    sinhalaSize: 120,
    englishSize: 100,
    sinhalaPosition: 10
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    // Handle translation requests if needed
    sendResponse({success: true});
  }
  return true;
});
