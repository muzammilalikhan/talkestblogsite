// Instagram Reels Downloader - Content Script
let isScanning = false;
let scrapedReels = [];
let hasMoreToLoad = true;

// Listen for messages from popup/sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scanReels') {
    if (isScanning) {
      sendResponse({ status: 'already_scanning' });
      return true;
    }
    
    isScanning = true;
    scrapedReels = [];
    hasMoreToLoad = true;
    
    // Check if we're on a profile page
    if (!window.location.href.includes('instagram.com/')) {
      chrome.runtime.sendMessage({ type: 'error', error: 'Please navigate to an Instagram profile page' });
      sendResponse({ status: 'invalid_page' });
      return true;
    }
    
    sendResponse({ status: 'scanning' });
    
    // Start the scanning process
    startScanning();
  }
  else if (message.action === 'downloadSingle') {
    downloadSingleReel(message.url, message.reelId);
    sendResponse({ status: 'downloading' });
  }
  else if (message.action === 'downloadAll') {
    downloadAllReels(message.reels);
    sendResponse({ status: 'downloading' });
  }
  
  return true;
});

async function startScanning() {
  try {
    chrome.runtime.sendMessage({ type: 'scan_started' });
    
    // Navigate to reels tab if not already there
    const reelsTab = document.querySelector('a[href*="/reels"]');
    if (reelsTab && !window.location.href.includes('/reels')) {
      reelsTab.click();
      await sleep(2000);
    }
    
    // Scroll and collect reels
    await scrollAndCollectReels();
    
    // Send complete results
    chrome.runtime.sendMessage({ 
      type: 'scan_complete', 
      reels: scrapedReels.map(url => ({ url }))
    });
    
    isScanning = false;
  } catch (error) {
    console.error('Scanning error:', error);
    chrome.runtime.sendMessage({ type: 'error', error: error.message });
    isScanning = false;
  }
}

async function scrollAndCollectReels() {
  let previousCount = 0;
  let noProgressCount = 0;
  
  while (hasMoreToLoad && noProgressCount < 3) {
    // Collect reel URLs from current view
    collectReelLinks();
    
    chrome.runtime.sendMessage({ 
      type: 'scan_progress', 
      count: scrapedReels.length 
    });
    
    // Check if we found new reels
    if (scrapedReels.length === previousCount) {
      noProgressCount++;
    } else {
      noProgressCount = 0;
      previousCount = scrapedReels.length;
    }
    
    // Scroll down to load more
    window.scrollTo(0, document.body.scrollHeight);
    await sleep(1500);
    
    // Check if we've reached the end
    const bottomOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (bottomOfPage && scrapedReels.length === previousCount) {
      hasMoreToLoad = false;
    }
  }
}

function collectReelLinks() {
  // Find all reel links on the page
  const reelLinks = document.querySelectorAll('a[href*="/reel/"]');
  
  reelLinks.forEach(link => {
    const href = link.href;
    if (href && !scrapedReels.includes(href)) {
      scrapedReels.push(href);
    }
  });
}

async function downloadSingleReel(reelUrl, reelId) {
  try {
    // Extract video URL from the reel page
    const videoUrl = await extractVideoUrl(reelUrl);
    
    if (videoUrl) {
      // Download the video
      const blob = await downloadVideo(videoUrl);
      
      // Create download URL
      const downloadUrl = URL.createObjectURL(blob);
      
      // Trigger download
      await chrome.runtime.sendMessage({ 
        type: 'download_file', 
        url: downloadUrl, 
        filename: `reel_${reelId}.mp4`,
        isBlob: true
      });
      
      chrome.runtime.sendMessage({ 
        type: 'single_download_complete', 
        reelId: reelId 
      });
    } else {
      chrome.runtime.sendMessage({ 
        type: 'error', 
        error: 'Could not extract video URL' 
      });
    }
  } catch (error) {
    console.error('Single download error:', error);
    chrome.runtime.sendMessage({ type: 'error', error: error.message });
  }
}

async function downloadAllReels(reelUrls) {
  try {
    // Send reel URLs to background script for downloading
    chrome.runtime.sendMessage({ 
      type: 'download_all_reels', 
      reels: reelUrls 
    });
  } catch (error) {
    console.error('Download all error:', error);
    chrome.runtime.sendMessage({ type: 'error', error: error.message });
  }
}

async function extractVideoUrl(reelUrl) {
  try {
    const response = await fetch(reelUrl);
    const html = await response.text();
    
    // Extract video URL from the page HTML
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
