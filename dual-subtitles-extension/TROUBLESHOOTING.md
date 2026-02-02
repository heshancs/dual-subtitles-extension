# 🔧 Troubleshooting Guide

## Sinhala Subtitles Not Showing?

Follow these steps to fix the issue:

### Step 1: Check Console for Errors

1. **Right-click** on the Netflix/YouTube page
2. Click **"Inspect"** or press `F12`
3. Go to **"Console"** tab
4. Look for messages starting with "Dual Subtitles"

**What you should see:**
```
Dual Subtitles Extension: Initializing on www.netflix.com
Dual Subtitles: Netflix detected
Setting up Netflix subtitle detection...
Netflix observer started
Netflix subtitle detected: It's my first time.
Translation: මගේ පළමු වතාවයි.
```

### Step 2: Verify Extension is Active

1. Go to `chrome://extensions/`
2. Find "Dual Subtitles - English & Sinhala"
3. Make sure the toggle is **ON** (blue)
4. Check for any error messages

### Step 3: Check English Subtitles are ON

**Netflix:**
- Click the speech bubble icon in the player controls
- Select "English" subtitles
- Make sure it says "English" not "Off"

**YouTube:**
- Click the "CC" button (closed captions)
- Select "English" or "English (auto-generated)"
- Make sure CC icon is white/active

### Step 4: Refresh the Page

1. Close the video
2. Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to hard refresh
3. Reopen the video
4. Turn on English subtitles

### Step 5: Check Translation Service

1. Click the extension icon in Chrome toolbar
2. Make sure a translation service is selected:
   - **Free Service (LibreTranslate)** - selected by default
   - **Google Translate** - requires API key

### Step 6: Test Translation API

Open Console (F12) and paste this:

```javascript
// Test LibreTranslate
fetch('https://libretranslate.com/translate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    q: 'Hello world',
    source: 'en',
    target: 'si',
    format: 'text'
  })
})
.then(r => r.json())
.then(d => console.log('Translation test:', d))
.catch(e => console.error('Translation failed:', e));
```

**Expected result:**
```
Translation test: {translatedText: "හෙලෝ වර්ල්ඩ්"}
```

If you see an error, the translation service might be blocked or down.

### Step 7: Try Different Videos

Some videos might have issues:
- **Netflix**: Try a different show/movie
- **YouTube**: Try a popular video with manual captions (not auto-generated)

### Step 8: Reinstall Extension

1. Go to `chrome://extensions/`
2. Click **"Remove"** on the Dual Subtitles extension
3. Refresh the extensions page
4. Click **"Load unpacked"**
5. Select the extension folder again

## Common Issues & Solutions

### Issue: "Failed to fetch" in console

**Problem**: Network is blocking translation API

**Solutions:**
1. Check your internet connection
2. Try disabling VPN/proxy temporarily
3. Check if LibreTranslate.com is accessible in your browser
4. Switch to Google Translate API (requires API key)

### Issue: Subtitles appear but immediately disappear

**Problem**: Subtitle timing issue

**Solutions:**
1. Increase the position (10% → 15%) in settings
2. Refresh the page
3. Try pausing and playing the video

### Issue: Translations are gibberish

**Problem**: Translation service quality

**Solutions:**
1. Switch to Google Translate API (better quality)
2. Some phrases don't translate well - this is normal
3. Try LibreTranslate alternative servers

### Issue: Extension icon doesn't appear

**Problem**: Extension not loading properly

**Solutions:**
1. Make sure you extracted the ZIP file completely
2. Check manifest.json exists in the folder
3. Try restarting Chrome
4. Load extension again

### Issue: Works on YouTube but not Netflix

**Problem**: Netflix has stricter security

**Solutions:**
1. Make sure you're logged into Netflix
2. Try playing the video first, then enable extension
3. Check Netflix hasn't updated their player (might need extension update)

### Issue: Only works on some videos

**Problem**: Subtitle format varies

**Solution:** This is expected - different videos use different subtitle formats. Extension works best with:
- Netflix: Most movies and series
- YouTube: Videos with manual captions (not auto-generated)

## Still Not Working?

### Enable Detailed Logging

1. Open content.js in the extension folder
2. Look for `console.log` statements
3. They should show what's happening

### Check Permissions

1. Go to `chrome://extensions/`
2. Click "Details" on Dual Subtitles
3. Scroll to "Permissions"
4. Make sure it has access to:
   - netflix.com
   - youtube.com
   - translate.googleapis.com

### Manual Test

Try this in Console (F12) while video is playing:

```javascript
// Netflix test
document.querySelector('.player-timedtext-text-container');

// YouTube test  
document.querySelector('.ytp-caption-window-container');
```

If these return `null`, the subtitle elements aren't on the page yet.

## Need More Help?

**What to provide:**
1. Chrome version: Go to `chrome://version/`
2. Console errors: Copy all red errors
3. Which platform: Netflix or YouTube?
4. Which show/video: Name of the content
5. Screenshot of the issue

---

**Remember:** The extension needs:
✅ English subtitles turned ON
✅ Internet connection (for translation)
✅ Extension enabled
✅ Page refreshed after installation
