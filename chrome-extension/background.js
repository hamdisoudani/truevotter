console.log('Reddit Vote Tracker: Background script loaded');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Reddit Vote Tracker installed:', details.reason);
  
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      trackingEnabled: true,
      apiUrl: 'http://localhost:8000',
      firstLaunch: true
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackVote') {
    console.log('Vote tracked:', request.data);
    sendResponse({ success: true });
  }
});

async function updateBadge() {
  try {
    const response = await fetch('http://localhost:8000/votes/stats');
    const stats = await response.json();
    const totalVotes = stats.totalVotes || 0;
    
    chrome.action.setBadgeText({
      text: totalVotes > 0 ? totalVotes.toString() : ''
    });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4500' });
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

setInterval(updateBadge, 30000); // Every 30 seconds
updateBadge(); // Initial update
