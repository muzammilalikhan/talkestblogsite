// Background Service Worker for Instagram Reels Downloader

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'download_reels') {
    handleReelsDownload(message.reels);
  }
  return true;
});

async function handleReelsDownload(reelUrls) {
  try {
    const videoBlobs = [];
    
    // Download each reel
    for (let i = 0; i < reelUrls.length; i++) {
      const reelUrl = reelUrls[i];
      
      // Update progress
      chrome.runtime.sendMessage({ 
        type: 'download_progress', 
        current: i + 1, 
        total: reelUrls.length 
      });
      
      try {
        // Extract video URL from the reel page
        const videoUrl = await extractVideoUrl(reelUrl);
        
        if (videoUrl) {
          // Download the video
          const blob = await downloadVideo(videoUrl);
          
          // Extract reel ID for filename
          const reelId = extractReelId(reelUrl);
          
          videoBlobs.push({
            name: `reel_${reelId}_${i + 1}.mp4`,
            blob: blob
          });
        }
      } catch (error) {
        console.error(`Failed to download reel ${i + 1}:`, error);
      }
      
      // Add delay to avoid rate limiting
      await sleep(1000);
    }
    
    if (videoBlobs.length > 0) {
      // Create ZIP file
      await createAndDownloadZip(videoBlobs);
      
      chrome.runtime.sendMessage({ type: 'download_started' });
    } else {
      chrome.runtime.sendMessage({ 
        type: 'error', 
        error: 'No videos could be downloaded. The profile might be private or there was a network error.' 
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    chrome.runtime.sendMessage({ type: 'error', error: error.message });
  }
}

async function extractVideoUrl(reelUrl) {
  try {
    // Note: This is a simplified approach
    // In production, you might need to handle Instagram's anti-bot measures
    const response = await fetch(reelUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    
    const html = await response.text();
    
    // Try multiple patterns to find video URL
    const patterns = [
      /"video_url":"([^"]+)"/,
      /"src":"([^"]+\.mp4[^"]*)"/,
      /video_url\\":\\"([^"]+)"/,
      /"playUrl":"([^"]+)"/
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let videoUrl = match[1]
          .replace(/\\u0026/g, '&')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        
        // Validate URL
        if (videoUrl.startsWith('http')) {
          return videoUrl;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video URL:', error);
    return null;
  }
}

async function downloadVideo(videoUrl) {
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading video:', error);
    throw error;
  }
}

function extractReelId(reelUrl) {
  // Extract reel ID from URL
  const match = reelUrl.match(/\/reel\/([^\/\?]+)/);
  if (match && match[1]) {
    return match[1].substring(0, 15); // Use first 15 chars to keep filename reasonable
  }
  return Date.now().toString();
}

async function createAndDownloadZip(videoBlobs) {
  try {
    const zip = new JSZip();
    const folderName = `instagram_reels_${Date.now()}`;
    const reelFolder = zip.folder(folderName);
    
    // Add each video to the ZIP
    for (const video of videoBlobs) {
      reelFolder.file(video.name, video.blob);
    }
    
    // Generate ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create download URL
    const url = URL.createObjectURL(content);
    
    // Download the ZIP file
    await chrome.downloads.download({
      url: url,
      filename: `${folderName}.zip`,
      saveAs: false
    });
    
    // Clean up after delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw new Error('Failed to create ZIP file: ' + error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
