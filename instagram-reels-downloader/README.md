# Instagram Reels Downloader - Chrome Extension

## Overview
This Chrome extension allows you to download all reels from any public Instagram profile with a single click. The downloaded reels are saved in an organized folder structure.

## Features
- ✅ One-click download for all reels from any Instagram profile
- ✅ Automatic scrolling to load all reels
- ✅ Organized folder structure for downloads
- ✅ Progress tracking during scraping and download
- ✅ Works on public Instagram profiles only

## Installation Steps

### 1. Download/Clone the Extension
Make sure all files are in the `instagram-reels-downloader` folder:
```
instagram-reels-downloader/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 2. Create Icon Files
You need to create three PNG icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor or online tool to create these icons.

### 3. Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right corner)
4. Click **Load unpacked**
5. Select the `instagram-reels-downloader` folder
6. The extension should now appear in your extensions list

## Usage Instructions

1. **Navigate to Instagram**: Go to any public Instagram profile page (e.g., `https://www.instagram.com/username/`)

2. **Click Extension Icon**: Click on the Instagram Reels Downloader icon in your Chrome toolbar

3. **Download All Reels**: Click the "Download All Reels" button

4. **Wait for Processing**: 
   - The extension will automatically scroll through the profile to load all reels
   - It will collect all reel URLs
   - Then download each video file

5. **Check Downloads**: All reels will be downloaded to your default Downloads folder in a timestamped folder

## Requirements

- Google Chrome browser (version 88 or higher)
- Internet connection
- Target Instagram profile must be **public**
- Sufficient storage space for downloaded videos

## Technical Requirements & Dependencies

### Required Chrome Permissions:
- `activeTab` - Access to current Instagram tab
- `scripting` - Inject content scripts
- `downloads` - Download video files
- Host permissions for `instagram.com`

### External Libraries Needed (for production):
For full ZIP file functionality, you should integrate:
- **JSZip** (https://stuk.github.io/jszip/) - For creating ZIP archives
- Include it in your extension folder and reference it in manifest.json

### File Structure for Production:
```
instagram-reels-downloader/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── lib/
│   └── jszip.min.js          # JSZip library
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Limitations & Notes

⚠️ **Important Considerations:**

1. **Private Profiles**: This extension only works with public Instagram profiles
2. **Rate Limiting**: Instagram may temporarily block requests if too many reels are downloaded quickly
3. **Video Quality**: Downloads use the quality available through Instagram's public API
4. **Terms of Service**: Ensure you comply with Instagram's Terms of Service when using this extension
5. **Copyright**: Only download content you have permission to use

## Troubleshooting

### Extension not working?
- Refresh the Instagram page
- Make sure you're on a public profile
- Check that the extension is enabled in `chrome://extensions/`

### No reels found?
- Ensure the profile has reels
- Try manually scrolling through the reels tab first
- Check console for errors (F12 → Console)

### Downloads failing?
- Check your internet connection
- Instagram may have rate-limited your IP
- Wait a few minutes and try again

## Development

### To modify the extension:
1. Edit the source files in the folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test the changes

### Building for Distribution:
1. Go to `chrome://extensions/`
2. Click "Pack extension"
3. Select the extension folder
4. Generate the `.crx` file

## License

This project is for educational purposes. Please respect Instagram's Terms of Service and copyright laws.

## Support

For issues or questions, check the browser console for error messages and ensure:
- You're using the latest Chrome version
- The target profile is public
- You have a stable internet connection
