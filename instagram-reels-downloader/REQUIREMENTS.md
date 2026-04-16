# Instagram Reels Downloader - Requirements Document

## Project Overview
Chrome extension to download all reels from any public Instagram profile with a single click, packaged as a .zip file.

## Technical Requirements

### 1. Chrome Extension Manifest (Manifest V3)
- **manifest_version**: 3
- **Required Permissions**:
  - `activeTab` - Access to current Instagram tab
  - `scripting` - Inject content scripts into pages
  - `downloads` - Download video files
  - `storage` - Store temporary data
  
- **Host Permissions**:
  - `https://www.instagram.com/*`
  - `https://instagram.com/*`

### 2. Core Components

#### A. manifest.json
- Extension configuration file
- Defines permissions, icons, and entry points

#### B. popup.html & popup.js
- User interface for the extension
- Contains "Download All Reels" button
- Shows progress and status messages

#### C. content.js
- Content script injected into Instagram pages
- Responsible for:
  - Detecting reel elements on the page
  - Auto-scrolling to load all reels
  - Collecting reel URLs
  - Extracting video download links

#### D. background.js (Service Worker)
- Background processing
- Handles:
  - Downloading video files
  - Creating ZIP archive
  - Managing download queue
  - Communication between components

### 3. External Libraries Required

#### JSZip (Mandatory for ZIP functionality)
- **Purpose**: Create ZIP files in the browser
- **Source**: https://stuk.github.io/jszip/
- **Implementation**: 
  - Download jszip.min.js
  - Include in `lib/` folder
  - Reference in manifest.json or popup.html

#### Optional: FileSaver.js
- **Purpose**: Better file saving control
- **Source**: https://github.com/eligrey/FileSaver.js

### 4. File Structure
```
instagram-reels-downloader/
├── manifest.json           # Extension configuration
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── content.js             # Page scraping logic
├── background.js          # Background service worker
├── lib/
│   └── jszip.min.js       # ZIP creation library
├── icons/
│   ├── icon16.png         # 16x16 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
├── package.json           # Node.js package info
└── README.md              # Documentation
```

### 5. Functional Requirements

#### Feature 1: Profile Detection
- Detect when user is on an Instagram profile page
- Verify profile is public (not private)
- Identify reels section/tab

#### Feature 2: Auto-Scrolling
- Automatically scroll through the reels section
- Load all reels by triggering infinite scroll
- Detect when all reels are loaded

#### Feature 3: URL Collection
- Extract all reel URLs from the page
- Store unique URLs only
- Track collection progress

#### Feature 4: Video Extraction
- Navigate to each reel URL
- Extract direct video download URL from page HTML
- Handle different video quality options

#### Feature 5: Batch Download
- Download all videos sequentially
- Add delays to avoid rate limiting
- Track download progress

#### Feature 6: ZIP Creation
- Combine all downloaded videos into a single ZIP file
- Name files appropriately (e.g., reel_001.mp4, reel_002.mp4)
- Trigger ZIP file download

### 6. Technical Challenges & Solutions

#### Challenge 1: Instagram's Dynamic Loading
- **Problem**: Instagram uses lazy loading and infinite scroll
- **Solution**: Implement auto-scroll with detection of new content

#### Challenge 2: Video URL Extraction
- **Problem**: Video URLs are embedded in JavaScript/JSON
- **Solution**: Parse page HTML with regex patterns to find video_url fields

#### Challenge 3: CORS Restrictions
- **Problem**: Direct fetch requests may be blocked
- **Solution**: Use content script to access page resources directly

#### Challenge 4: Rate Limiting
- **Problem**: Instagram may block too many rapid requests
- **Solution**: Add delays between requests (1-2 seconds)

#### Challenge 5: Private Profiles
- **Problem**: Cannot access private profile content
- **Solution**: Detect and show error message for private profiles

### 7. Development Requirements

#### Software Needed:
- Google Chrome browser (version 88+)
- Text editor (VS Code, Sublime, etc.)
- Basic knowledge of JavaScript

#### Testing Requirements:
- Test on multiple public Instagram profiles
- Test with profiles having different numbers of reels (10, 50, 100+)
- Test error handling (private profiles, network errors)
- Test ZIP file creation and extraction

### 8. Performance Considerations

- **Memory Management**: Clean up blobs and object URLs after use
- **Network Efficiency**: Add appropriate delays between requests
- **User Experience**: Show progress indicators during long operations
- **Error Recovery**: Handle failures gracefully without crashing

### 9. Security & Compliance

#### Important Notes:
- ⚠️ Only works with **public** Instagram profiles
- ⚠️ Must comply with Instagram's Terms of Service
- ⚠️ Respect copyright and intellectual property rights
- ⚠️ Do not use for commercial purposes without permission
- ⚠️ Add appropriate disclaimers in the extension

### 10. Future Enhancements (Optional)

- [ ] Support for stories downloads
- [ ] Support for IGTV videos
- [ ] Quality selection (SD/HD)
- [ ] Filter by date range
- [ ] Download specific reels only (checkbox selection)
- [ ] Progress resumption if interrupted
- [ ] Custom filename patterns
- [ ] Support for Reels from hashtag pages

### 11. Installation & Testing Steps

1. **Load Extension**:
   - Go to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the extension folder

2. **Test Workflow**:
   - Navigate to a public Instagram profile
   - Click extension icon
   - Click "Download All Reels"
   - Verify all reels are downloaded in ZIP format

3. **Verify Output**:
   - Check Downloads folder
   - Extract ZIP file
   - Verify all videos play correctly

### 12. Dependencies Summary

| Dependency | Purpose | Required |
|------------|---------|----------|
| JSZip | Create ZIP files | Yes |
| Chrome APIs | Browser integration | Yes |
| None others | Pure JavaScript | - |

### 13. Estimated Development Time

- **Basic Version**: 4-6 hours
- **Production Ready**: 8-12 hours (with testing and polish)
- **With Advanced Features**: 16-24 hours

---

## Next Steps

1. ✅ Core files created (manifest.json, popup.html, popup.js, content.js, background.js)
2. ✅ Icon placeholders created
3. ✅ Documentation prepared
4. ⏳ **TODO**: Download and integrate JSZip library for actual ZIP functionality
5. ⏳ **TODO**: Test on live Instagram profiles
6. ⏳ **TODO**: Refine video URL extraction patterns based on Instagram's current HTML structure
7. ⏳ **TODO**: Add proper error handling and edge cases
