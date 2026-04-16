document.getElementById('downloadBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  const progressDiv = document.getElementById('progress');
  const btn = document.getElementById('downloadBtn');

  try {
    btn.disabled = true;
    statusDiv.textContent = 'Starting...';
    progressDiv.textContent = '';

    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('instagram.com')) {
      statusDiv.textContent = '❌ Please navigate to an Instagram profile first!';
      btn.disabled = false;
      return;
    }

    // Send message to content script to start scraping
    chrome.tabs.sendMessage(tab.id, { action: 'startScraping' }, (response) => {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = '❌ Error: Please refresh the page and try again.';
        btn.disabled = false;
        return;
      }

      if (response && response.status === 'started') {
        statusDiv.textContent = '✅ Scraping started! Check the page for progress.';
        progressDiv.textContent = 'Scrolling and collecting reels...';
      } else {
        statusDiv.textContent = '❌ Failed to start scraping.';
        btn.disabled = false;
      }
    });

  } catch (error) {
    console.error('Error:', error);
    statusDiv.textContent = '❌ An error occurred: ' + error.message;
    btn.disabled = false;
  }
});

// Listen for messages from content script or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const statusDiv = document.getElementById('status');
  const progressDiv = document.getElementById('progress');
  const btn = document.getElementById('downloadBtn');

  if (message.type === 'scraping_progress') {
    progressDiv.textContent = `Found ${message.count} reels so far...`;
  } else if (message.type === 'scraping_complete') {
    statusDiv.textContent = `✅ Found ${message.totalReels} reels! Starting download...`;
    progressDiv.textContent = 'Preparing ZIP file...';
  } else if (message.type === 'download_started') {
    statusDiv.textContent = '✅ Download started! Check your downloads folder.';
    progressDiv.textContent = '';
    btn.disabled = false;
  } else if (message.type === 'error') {
    statusDiv.textContent = '❌ Error: ' + message.error;
    btn.disabled = false;
  }
});
