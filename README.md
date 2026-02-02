# 🎬 Dual Subtitles - English & Sinhala

A Chrome extension that displays English subtitles with Sinhala translations on Netflix and YouTube.

## ✨ Features

- **Automatic Translation**: Translates English subtitles to Sinhala in real-time
- **Dual Display**: Shows Sinhala at the top, English at the bottom
- **Two Translation Options**:
  - **Free**: MyMemory API (completely free, no API key needed, reliable)
  - **Premium**: Google Translate API (better quality, 500,000 chars/month free)
- **Customizable**: Adjust font sizes, positions, and colors
- **Works on**: Netflix and YouTube
- **Caching**: Smart caching to reduce API calls and improve performance

## 📦 Installation

### Option 1: Load Unpacked Extension (Recommended for Development)

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

### Option 2: Pack and Install (For Distribution)

1. In `chrome://extensions/`, click "Pack extension"
2. Select the `dual-subtitles-extension` folder
3. Click "Pack Extension"
4. Install the generated `.crx` file

## 🚀 Quick Start

### Using Free Translation (No Setup Required)

1. **Install the extension** (see above)
2. **Go to Netflix or YouTube**
3. **Play a video with English subtitles**
4. **Sinhala translations appear automatically at the top!**

That's it! The free MyMemory API works immediately with no configuration.

### Using Google Translate API (Better Quality)

1. **Get a Google Cloud API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)
   - Enable "Cloud Translation API"
   - Go to "Credentials" → Create API Key
   - Copy your API key

2. **Configure the Extension**:
   - Click the extension icon in Chrome toolbar
   - Select "Google Translate (Better Quality)"
   - Paste your API key
   - Click "Save Settings"

3. **Enjoy Better Translations**:
   - Google Translate provides more accurate and natural Sinhala translations
   - Free tier: 500,000 characters/month
   - After free tier: $20 per million characters

## ⚙️ Settings

Click the extension icon to customize:

### Translation Service
- **Free Service**: Uses LibreTranslate (no API key needed)
- **Google Translate**: Better quality (requires API key)

### Display Settings
- **Sinhala Size**: 80% - 200% (default: 120%)
- **English Size**: 80% - 200% (default: 100%)
- **Sinhala Position**: 5% - 30% from top (default: 10%)

## 💰 Cost Breakdown

### Free Option (MyMemory API)
- **Cost**: $0 forever
- **Quality**: Good for most content
- **Limitations**: 500 character limit per request (automatically handled)

### Google Translate API
- **Free Tier**: 500,000 characters/month (never expires!)
- **After Free Tier**: $20 per 1 million characters
- **Example Usage**:
  - 1 hour movie = ~8,000 words = ~50,000 characters
  - Free tier = ~10 movies per month
  - Heavy use (60 movies/month) = ~$100/month

**Recommendation**: Start with the free option. Upgrade to Google Translate if you want better quality and can afford ~$10-20/month for heavy usage.

## 🎯 How It Works

1. **Subtitle Detection**: Extension monitors Netflix/YouTube for English subtitles
2. **Translation**: Sends subtitle text to translation API
3. **Caching**: Stores translations to avoid repeat API calls
4. **Display**: Shows Sinhala translation at customizable position
5. **Sync**: Keeps translations in sync with video playback

## 🐛 Troubleshooting

### Sinhala subtitles not appearing?

1. **Make sure English subtitles are turned on** in the video player
2. **Refresh the page** after installing the extension
3. **Check extension is enabled** at `chrome://extensions/`
4. **Check console for errors**: Right-click → Inspect → Console tab

### Translations are incorrect?

1. **Try Google Translate API** instead of free option (better quality)
2. **Note**: Machine translation isn't perfect - especially for idioms, slang, or context-dependent phrases

### Netflix specific issues?

1. Netflix's player structure can change - if subtitles don't work, try refreshing
2. Make sure you're using the latest version of Chrome

### YouTube specific issues?

1. Auto-generated subtitles may not trigger properly - try enabling manual CC
2. Some YouTube videos don't have English subtitles available

### Google API not working?

1. **Verify API key** is correct
2. **Check API is enabled** in Google Cloud Console
3. **Check billing** is set up (even for free tier)
4. **Check quota** - you might have exceeded free tier

## 🔒 Privacy & Security

- **Your API key is stored locally** in Chrome's sync storage (encrypted)
- **Translation requests** go directly to the API (not through our servers)
- **No data collection**: We don't collect or store any of your data
- **Open source**: You can review all code in this extension

## 📝 Technical Details

### Built With
- Vanilla JavaScript (no frameworks)
- Chrome Extension Manifest V3
- LibreTranslate API (free)
- Google Cloud Translation API (optional)

### Supported Languages
- Source: English
- Target: Sinhala (සිංහල)

### Browser Support
- Chrome/Chromium 88+
- Edge (Chromium) 88+
- Brave, Vivaldi, Opera (Chromium-based)

## 🤝 Contributing

Found a bug? Have a feature request? Contributions welcome!

## 📄 License

MIT License - feel free to modify and distribute

## 🙏 Acknowledgments

- LibreTranslate for free translation API
- Google Cloud Translation for high-quality translations
- Sri Lankan Chrome users for the inspiration!

---

**Enjoy your movies with full understanding! 🎬🍿**

සිනමා බලන්න සතුටින්! 🎉
