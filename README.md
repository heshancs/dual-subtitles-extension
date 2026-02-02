# 🎬 Dual Subtitles - English & Sinhala

A Chrome extension that displays Sinhala translations of English subtitles on Netflix and YouTube. **Pause to see translations - 100% Free!**

## ✨ Features

- **Pause-to-Translate**: Sinhala translation appears when you pause the video
- **Two Free Options**: MyMemory API or Google Translate (both free!)
- **Dual Display**: Shows Sinhala at top, English at bottom
- **Works on**: Netflix and YouTube
- **Fullscreen Support**: Works perfectly in fullscreen mode
- **Smart Caching**: Remembers translations to minimize API calls
- **Quota Tracking**: Built-in usage tracker for Google Translate
- **Auto Fallback**: Switches to free service if quota exceeded

## 🎯 How It Works

1. **Watch normally** - No translations while playing (saves API calls)
2. **Pause the video** - Sinhala translation appears instantly
3. **Resume playing** - Translation hides, continue watching
4. **Repeat** - Pause whenever you need to understand something

This approach uses **~50-100 translations per movie** - well under free limits!

## 📦 Installation

1. **Download this folder** to your computer

2. **Open Chrome Extensions page**:
   - Go to `chrome://extensions/`
   - Or click the three dots menu → Extensions → Manage Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `dual-subtitles-extension` folder
   - The extension icon should appear in your toolbar

## 🚀 Quick Start (Free - No Setup)

1. Install the extension
2. Go to Netflix or YouTube
3. Play a video with English subtitles enabled
4. **Pause the video** - Sinhala translation appears!

Works immediately with MyMemory API (no setup needed).

## ⭐ Better Quality with Google Translate (Still Free!)

Google Translate provides more accurate Sinhala translations. Here's how to use it **completely free**:

### Step 1: Get a Free API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Cloud Translation API"
4. Go to "Credentials" → Create API Key
5. Copy your API key

### Step 2: Set Daily Quota (Never Get Charged!)

> ⚠️ **Important**: Set a daily limit to stay within free tier forever!

1. Go to [Cloud Translation API Quotas](https://console.cloud.google.com/apis/api/translate.googleapis.com/quotas)
2. Find **"v2 and v3 general model characters per day"**
3. Click the ⋮ menu → "Edit quota"
4. Set to **16,666** characters/day (= 500,000/month = free tier)
5. Save

**With this limit, you'll never be charged!** The extension will automatically switch to the free MyMemory API if you hit the daily limit.

### Step 3: Configure Extension

1. Click the extension icon
2. Select "Google Translate"
3. Paste your API key
4. Save Settings

## 💰 Cost Summary

| Option | Quality | Cost | Daily Limit |
|--------|---------|------|-------------|
| MyMemory (default) | Good | **$0** | 1,000 requests |
| MyMemory + Email | Good | **$0** | 10,000 requests |
| Google Translate | **Better** | **$0** (with quota) | 16,666 chars |

**All options are free!** Google just requires a 2-minute setup.

## ⚙️ Settings

Click the extension icon to customize:

### Translation Service
- **Free Service**: MyMemory API - works instantly
- **Google Translate**: Better quality (requires free API key)

### Display Settings
- **Sinhala Size**: 80% - 200%
- **English Size**: 80% - 200%
- **Sinhala Position**: 5% - 30% from top

### Quota Tracking (Google)
- **Monthly usage** progress bar
- **Daily usage** progress bar
- **Adjustable daily limit** slider
- **Auto-fallback** when quota exceeded

## 🐛 Troubleshooting

### Sinhala subtitles not appearing when paused?
1. Make sure **English subtitles are enabled** in the video player
2. **Refresh the page** after installing
3. Check extension is enabled at `chrome://extensions/`

### Google API errors?
1. Verify API key is correct
2. Check Cloud Translation API is enabled
3. Make sure you set the daily quota limit
4. The extension automatically falls back to free service

### Netflix fullscreen not working?
- Refresh the page and try again

## 🔒 Privacy & Security

- **No data collection**: Nothing stored externally
- **Local storage only**: Settings in your browser
- **Direct API calls**: No middleman servers
- **Open source**: Review all code

## 📝 Technical Details

- Vanilla JavaScript
- Chrome Extension Manifest V3
- MyMemory Translation API
- Google Cloud Translation API (optional)

### Browser Support
- Chrome 88+
- Edge 88+
- Brave, Vivaldi, Opera

## 📄 License

MIT License

---

**Enjoy your movies with full understanding! 🎬🍿**

සිනමා බලන්න සතුටින්! 🎉
