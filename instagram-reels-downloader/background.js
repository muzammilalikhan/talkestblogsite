// Background Service Worker for Instagram Reels Downloader

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'download_all_reels') {
    handleReelsDownload(message.reels);
    sendResponse({ status: 'started' });
  }
  else if (message.type === 'download_file') {
    handleFileDownload(message.url, message.filename, message.isBlob);
    sendResponse({ status: 'started' });
  }
  return true;
});

async function handleFileDownload(url, filename, isBlob) {
  try {
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
    
    if (isBlob) {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch (error) {
    console.error('File download error:', error);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'error', error: error.message });
      }
    });
  }
}

async function handleReelsDownload(reelUrls) {
  try {
    const videoBlobs = [];
    
    for (let i = 0; i < reelUrls.length; i++) {
      const reelUrl = reelUrls[i];
      
      chrome.runtime.sendMessage({ 
        type: 'download_progress', 
        current: i + 1, 
        total: reelUrls.length 
      });
      
      try {
        const videoUrl = await extractVideoUrl(reelUrl);
        
        if (videoUrl) {
          const blob = await downloadVideo(videoUrl);
          const reelId = extractReelId(reelUrl);
          
          videoBlobs.push({
            name: `reel_${reelId}_${i + 1}.mp4`,
            blob: blob
          });
        }
      } catch (error) {
        console.error(`Failed to download reel ${i + 1}:`, error);
      }
      
      await sleep(1000);
    }
    
    if (videoBlobs.length > 0) {
      await createAndDownloadZip(videoBlobs);
      chrome.runtime.sendMessage({ type: 'download_complete' });
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
    const response = await fetch(reelUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    
    const html = await response.text();
    
    const patterns = [
      /"video_url":"([^"]+)"/,
      /"src":"([^"]+\.mp4[^"]*)"/,
      /video_url\\":\\"([^"]+)/,
      /"playUrl":"([^"]+)"/
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let videoUrl = match[1]
          .replace(/\\u0026/g, '&')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        
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
  const match = reelUrl.match(/\/reel\/([^\/\?]+)/);
  if (match && match[1]) {
    return match[1].substring(0, 15);
  }
  return Date.now().toString();
}

async function createAndDownloadZip(videoBlobs) {
  try {
    const jszipUrl = chrome.runtime.getURL('lib/jszip.min.js');
    const response = await fetch(jszipUrl);
    const jszipCode = await response.text();
    eval(jszipCode);
    
    const zip = new JSZip();
    const folderName = `instagram_reels_${Date.now()}`;
    const reelFolder = zip.folder(folderName);
    
    for (const video of videoBlobs) {
      reelFolder.file(video.name, video.blob);
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    await chrome.downloads.download({
      url: url,
      filename: `${folderName}.zip`,
      saveAs: false
    });
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
  } catch (error) {
    console.error('Error creating ZIP:', error);
    for (const video of videoBlobs) {
      const url = URL.createObjectURL(video.blob);
      await chrome.downloads.download({
        url: url,
        filename: video.name,
        saveAs: false
      });
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      await sleep(500);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
