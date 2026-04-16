// Side Panel Script for Instagram Reels Downloader
let scrapedReels = [];
let isScanning = false;

const scanBtn = document.getElementById('scanBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const statusDiv = document.getElementById('status');
const reelsList = document.getElementById('reelsList');
const emptyState = document.getElementById('emptyState');
const loading = document.getElementById('loading');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Open side panel when clicking extension icon
chrome.action.onClicked.addListener(() => {
  chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStatus('Ready! Navigate to an Instagram profile and click Scan.', 'success');
});

// Scan for reels
scanBtn.addEventListener('click', async () => {
  if (isScanning) return;
  
  try {
    isScanning = true;
    scanBtn.disabled = true;
    downloadAllBtn.disabled = true;
    scrapedReels = [];
    reelsList.innerHTML = '';
    
    showLoading(true);
    hideEmptyState();
    updateStatus('Scanning for reels...', '');
    
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('instagram.com')) {
      updateStatus('❌ Please navigate to Instagram first!', 'error');
      showLoading(false);
      scanBtn.disabled = false;
      return;
    }
    
    // Send message to content script to scan for reels
    chrome.tabs.sendMessage(tab.id, { action: 'scanReels' }, (response) => {
      if (chrome.runtime.lastError) {
        updateStatus('❌ Error: Please refresh the page and try again.', 'error');
        showLoading(false);
        scanBtn.disabled = false;
        return;
      }
      
      if (response && response.status === 'scanning') {
        // Scanning started, wait for results
      } else {
        updateStatus('❌ Failed to start scanning.', 'error');
        showLoading(false);
        scanBtn.disabled = false;
      }
    });
    
  } catch (error) {
    console.error('Scan error:', error);
    updateStatus('❌ An error occurred: ' + error.message, 'error');
    showLoading(false);
    scanBtn.disabled = false;
    isScanning = false;
  }
});

// Download all reels
downloadAllBtn.addEventListener('click', async () => {
  if (scrapedReels.length === 0) return;
  
  try {
    downloadAllBtn.disabled = true;
    updateStatus('Starting download of all reels...', '');
    showProgress(0, scrapedReels.length);
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { 
      action: 'downloadAll', 
      reels: scrapedReels 
    });
    
  } catch (error) {
    console.error('Download all error:', error);
    updateStatus('❌ Download failed: ' + error.message, 'error');
    downloadAllBtn.disabled = false;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'scan_started') {
    updateStatus('🔍 Scanning reels on this profile...', '');
  } 
  else if (message.type === 'scan_progress') {
    updateStatus(`Found ${message.count} reels so far...`, '');
  } 
  else if (message.type === 'scan_complete') {
    scrapedReels = message.reels || [];
    isScanning = false;
    scanBtn.disabled = false;
    showLoading(false);
    
    if (scrapedReels.length > 0) {
      updateStatus(`✅ Found ${scrapedReels.length} reels!`, 'success');
      downloadAllBtn.disabled = false;
      renderReelsList();
    } else {
      updateStatus('⚠️ No reels found. Make sure the profile has public reels.', 'error');
      showEmptyState();
    }
  } 
  else if (message.type === 'download_progress') {
    showProgress(message.current, message.total);
    updateStatus(`Downloading ${message.current}/${message.total}...`, '');
  } 
  else if (message.type === 'download_complete') {
    updateStatus('✅ All downloads completed!', 'success');
    downloadAllBtn.disabled = false;
    hideProgress();
  } 
  else if (message.type === 'single_download_complete') {
    updateStatus('✅ Download started!', 'success');
    // Re-enable the specific button
    const btn = document.querySelector(`[data-reel-id="${message.reelId}"]`);
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⬇️ Download';
    }
  } 
  else if (message.type === 'error') {
    updateStatus('❌ Error: ' + message.error, 'error');
    isScanning = false;
    scanBtn.disabled = false;
    showLoading(false);
    downloadAllBtn.disabled = false;
    hideProgress();
  }
  
  return true;
});

function renderReelsList() {
  reelsList.innerHTML = '';
  
  if (scrapedReels.length === 0) {
    showEmptyState();
    return;
  }
  
  hideEmptyState();
  
  scrapedReels.forEach((reel, index) => {
    const reelId = extractReelId(reel.url);
    const item = document.createElement('div');
    item.className = 'reel-item';
    item.innerHTML = `
      <div class="reel-info">
        <div class="reel-title">Reel #${index + 1}</div>
        <div class="reel-id">${reelId}</div>
      </div>
      <button class="btn-download-single" data-reel-id="${reelId}" data-url="${reel.url}">
        ⬇️ Download
      </button>
    `;
    
    reelsList.appendChild(item);
    
    // Add click listener for individual download
    const downloadBtn = item.querySelector('.btn-download-single');
    downloadBtn.addEventListener('click', async () => {
      downloadBtn.disabled = true;
      downloadBtn.textContent = '⏳ Downloading...';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { 
        action: 'downloadSingle', 
        url: reel.url,
        reelId: reelId
      });
    });
  });
}

function extractReelId(url) {
  const match = url.match(/\/reel\/([^\/\?]+)/);
  if (match && match[1]) {
    return match[1].substring(0, 12) + '...';
  }
  return 'unknown';
}

function updateStatus(message, type = '') {
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  statusDiv.className = 'status';
  if (type) {
    statusDiv.classList.add(type);
  }
}

function showLoading(show) {
  loading.style.display = show ? 'flex' : 'none';
}

function showEmptyState() {
  emptyState.style.display = 'block';
  reelsList.style.display = 'none';
}

function hideEmptyState() {
  emptyState.style.display = 'none';
  reelsList.style.display = 'flex';
}

function showProgress(current, total) {
  progressContainer.style.display = 'block';
  const percentage = (current / total) * 100;
  progressFill.style.width = percentage + '%';
  progressText.textContent = `Downloading ${current}/${total}`;
}

function hideProgress() {
  progressContainer.style.display = 'none';
}
