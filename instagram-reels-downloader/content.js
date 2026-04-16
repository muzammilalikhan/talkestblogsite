// Instagram Reels Downloader - Content Script
let isScraping = false;
let scrapedReels = [];
let hasMoreToLoad = true;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startScraping') {
    if (isScraping) {
      sendResponse({ status: 'already_scraping' });
      return true;
    }
    
    isScraping = true;
    scrapedReels = [];
    hasMoreToLoad = true;
    
    // Check if we're on a profile page with reels
    if (!window.location.href.includes('/reels') && !window.location.href.includes('instagram.com/')) {
      chrome.runtime.sendMessage({ type: 'error', error: 'Please navigate to an Instagram profile page' });
      sendResponse({ status: 'invalid_page' });
      return true;
    }
    
    sendResponse({ status: 'started' });
    
    // Start the scraping process
    startScraping();
  }
  
  return true;
});

async function startScraping() {
  try {
    // Navigate to reels tab if not already there
    const reelsTab = document.querySelector('a[href*="/reels"]');
    if (reelsTab && !window.location.href.includes('/reels')) {
      reelsTab.click();
      await sleep(2000);
    }
    
    // Scroll and collect reels
    await scrollAndCollectReels();
    
    // Download all collected reels
    if (scrapedReels.length > 0) {
      await downloadAllReels();
    } else {
      chrome.runtime.sendMessage({ 
        type: 'error', 
        error: 'No reels found. Make sure the profile has public reels.' 
      });
    }
    
    isScraping = false;
  } catch (error) {
    console.error('Scraping error:', error);
    chrome.runtime.sendMessage({ type: 'error', error: error.message });
    isScraping = false;
  }
}

async function scrollAndCollectReels() {
  let previousCount = 0;
  let noProgressCount = 0;
  
  while (hasMoreToLoad && noProgressCount < 3) {
    // Collect reel URLs from current view
    collectReelLinks();
    
    chrome.runtime.sendMessage({ 
      type: 'scraping_progress', 
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
  
  chrome.runtime.sendMessage({ 
    type: 'scraping_complete', 
    totalReels: scrapedReels.length 
  });
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

async function downloadAllReels() {
  try {
    // Send reel URLs to background script for downloading
    chrome.runtime.sendMessage({ 
      type: 'download_reels', 
      reels: scrapedReels 
    });
  } catch (error) {
    console.error('Download error:', error);
    chrome.runtime.sendMessage({ type: 'error', error: error.message });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to extract video URL from a reel page
async function extractVideoUrl(reelUrl) {
  try {
    const response = await fetch(reelUrl);
    const html = await response.text();
    
    // Extract video URL from the page HTML
    const videoMatch = html.match(/"video_url":"([^"]+)"/);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1].replace(/\\u0026/g, '&');
    }
    
    // Try alternative patterns
    const altMatch = html.match(/"src":"([^"]+\.mp4[^"]*)"/);
    if (altMatch && altMatch[1]) {
      return altMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video URL:', error);
    return null;
  }
}
