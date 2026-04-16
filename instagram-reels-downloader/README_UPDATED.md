# Instagram Reels Downloader - Chrome Extension

A fast, simple, and optimized Chrome extension to download Instagram Reels from any public profile. Features a modern right-side panel layout with individual and bulk download options.

## Features

✅ **Right Side Panel Layout** - Clean, modern sidebar that opens on the right side of your browser
✅ **Scan All Reels** - Automatically finds all reels on a public Instagram profile
✅ **Individual Download** - Download specific reels one by one
✅ **Bulk Download** - Download all reels at once in a ZIP file
✅ **Fast & Optimized** - Efficient scrolling and downloading algorithm
✅ **Simple UI** - Easy-to-use interface with progress tracking
✅ **Progress Indicator** - Real-time download progress updates

## Installation

### Method 1: Load Unpacked (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right corner)
3. Click "Load unpacked"
4. Select the `instagram-reels-downloader` folder
5. The extension icon will appear in your toolbar

### Method 2: Pin the Extension

1. Click the puzzle piece icon (Extensions) in Chrome toolbar
2. Find "Instagram Reels Downloader"
3. Click the pin icon to keep it visible

## How to Use

1. **Navigate to Instagram**
   - Go to any public Instagram profile page (e.g., `instagram.com/username`)

2. **Open the Side Panel**
   - Click the extension icon in your toolbar
   - The side panel will open on the right side

3. **Scan for Reels**
   - Click the "🔍 Scan for Reels" button
   - The extension will automatically scroll through the profile and find all reels
   - Wait for the scan to complete

4. **Download Reels**
   
   **Option A: Download Individual Reels**
   - Scroll through the list of found reels
   - Click "⬇️ Download" next to any reel you want to download
   - The video will download immediately
   
   **Option B: Download All Reels**
   - Click the "📦 Download All" button
   - All reels will be downloaded as a ZIP file
   - Progress is shown in real-time

5. **Access Your Downloads**
   - Individual reels download as `.mp4` files
   - Bulk downloads come as a `.zip` file containing all reels
   - Check your browser's Downloads folder

## File Structure

```
instagram-reels-downloader/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── content.js          # Content script for Instagram pages
├── sidepanel.html      # Side panel UI
├── sidepanel.js        # Side panel logic
├── popup.html          # Legacy popup (optional)
├── popup.js            # Legacy popup logic
├── lib/
│   └── jszip.min.js    # JSZip library for ZIP creation
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Permissions Explained

- **activeTab**: Access the current Instagram tab
- **scripting**: Inject scripts into Instagram pages
- **downloads**: Download reel videos
- **sidePanel**: Display the right-side panel interface
- **Host permissions**: Access Instagram URLs only

## Important Notes

⚠️ **Public Profiles Only**: This extension only works with public Instagram profiles. Private profiles are not supported.

⚠️ **Rate Limiting**: The extension includes built-in delays to avoid Instagram's rate limiting. Don't download too many reels too quickly.

⚠️ **Respect Copyright**: Only download content you have permission to use. Respect creators' rights and Instagram's Terms of Service.

⚠️ **Personal Use**: This extension is for personal use only. Commercial use may violate Instagram's policies.

## Troubleshooting

### Extension doesn't find any reels
- Make sure you're on a public profile
- Navigate to the Reels tab on the profile first
- Refresh the page and try again

### Download fails
- Check your internet connection
- The profile might be private
- Instagram may have temporary restrictions

### Side panel doesn't open
- Click the extension icon once more
- Make sure you're on an Instagram page
- Try refreshing the page

## Technical Details

- **Manifest Version**: 3 (Latest Chrome Extension standard)
- **Side Panel API**: Uses Chrome's modern sidePanel API
- **Video Extraction**: Parses Instagram's internal APIs to extract video URLs
- **ZIP Creation**: Uses JSZip library for efficient bulk downloads
- **Optimized Scrolling**: Smart scroll detection to load all reels efficiently

## Updates

### Version 2.0 (Current)
- ✨ New right-side panel layout
- ✨ Individual reel download option
- ✨ Improved UI with progress tracking
- ✨ Better error handling
- ✨ Optimized performance

### Version 1.0 (Previous)
- Basic bulk download functionality
- Simple popup interface

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure you're using the latest version of Chrome
3. Make sure the Instagram profile is public

## Disclaimer

This extension is not affiliated with Instagram or Meta. Use responsibly and respect content creators' rights. The extension is provided as-is without warranty.

---

**Made with ❤️ for easy Instagram content archiving**
