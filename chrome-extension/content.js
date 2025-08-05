console.log('Reddit Vote Tracker: Content script loaded');

const API_BASE_URL = 'http://localhost:8000';
let authToken = null;
let currentUser = null;
let redditUserId = null;

chrome.storage.sync.get(['authToken', 'currentUser', 'firstLaunch', 'isLinkingReddit', 'linkingTabId'], (result) => {
  authToken = result.authToken;
  currentUser = result.currentUser;
  
  if (result.isLinkingReddit && window.location.pathname.includes('/user/')) {
    handleRedditLinkingFlow();
  } else if (authToken && currentUser && result.firstLaunch && window.location.pathname.includes('/user/')) {
    handleFirstLaunchProfileDetection();
  }
});

const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...args) {
  this._method = method;
  this._url = url;
  return originalXHROpen.apply(this, [method, url, ...args]);
};

XMLHttpRequest.prototype.send = function(data) {
  if (this._url.includes('matrix.redditspace.com/_matrix/client/v3/account/whoami')) {
    this.addEventListener('load', function() {
      if (this.status === 200) {
        try {
          const response = JSON.parse(this.responseText);
          const redditId = response.user_id.replace('@', '').replace(':reddit.com', '');
          handleRedditUserIdentification(redditId);
        } catch (error) {
          console.error('Error parsing whoami response:', error);
        }
      }
    });
    
    this.addEventListener('error', function() {
      console.error('Error loading whoami endpoint');
      updateLinkingProgress('Error loading Reddit user data. Please refresh the page.');
    });
    
    this.addEventListener('timeout', function() {
      console.error('Timeout loading whoami endpoint');
      updateLinkingProgress('Timeout loading Reddit user data. Please refresh the page.');
    });
  }
  
  if (this._url.includes('/svc/shreddit/graphql') && data) {
    try {
      const payload = JSON.parse(data);
      if (payload.operation === 'UpdatePostVoteState') {
        handleVoteInterception(payload.variables.input);
      }
    } catch (error) {
      console.error('Error parsing GraphQL payload:', error);
    }
  }
  
  return originalXHRSend.apply(this, [data]);
};

function handleRedditUserIdentification(redditId) {
  redditUserId = redditId;
  console.log('Reddit user ID identified:', redditId);
  
  chrome.storage.sync.get(['isLinkingReddit'], (result) => {
    if (result.isLinkingReddit) {
      updateLinkingProgress('Reddit user ID extracted successfully');
      setTimeout(() => {
        const redditUsername = extractRedditUsername();
        if (redditUsername) {
          updateLinkingProgress('Reddit username extracted: ' + redditUsername);
          setTimeout(() => {
            if (verifyOwnProfile(redditUsername)) {
              updateLinkingProgress('Profile verification successful');
              setTimeout(() => {
                showEnhancedRedditConsentPrompt(redditId, redditUsername);
              }, 1000);
            } else {
              showProfileVerificationError();
            }
          }, 1000);
        } else {
          updateLinkingProgress('Unable to extract Reddit username. Please ensure you are on your profile page.');
        }
      }, 1000);
    } else if (authToken && currentUser && !currentUser.redditUsername) {
      showRedditConsentPrompt(redditId);
    }
  });
}

function handleVoteInterception(voteInput) {
  if (!authToken || !currentUser) {
    showNotification('Please login to track votes');
    return;
  }

  const postId = voteInput.postId.replace('t3_', '');
  let voteType = 'none';
  
  if (voteInput.voteState === 'UP') {
    voteType = 'upvote';
  } else if (voteInput.voteState === 'DOWN') {
    voteType = 'downvote';
  }

  const postData = extractPostDataFromPage(postId);
  if (postData) {
    trackVote(postData, voteType);
  }
}

function extractPostDataFromPage(postId) {
  try {
    const postElement = document.querySelector(`[data-testid="post-container"]`) || 
                       document.querySelector('.Post');
    
    if (!postElement) return null;

    const titleElement = postElement.querySelector('h3') || 
                        postElement.querySelector('[data-testid="post-content"] h3');
    
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown Post';
    
    const subredditMatch = window.location.pathname.match(/\/r\/([^\/]+)/);
    const subreddit = subredditMatch ? subredditMatch[1] : 'unknown';
    
    const authorElement = postElement.querySelector('[data-testid="post_author_link"]') ||
                         postElement.querySelector('.author');
    
    const author = authorElement ? 
                  authorElement.textContent.replace(/^u\//, '').trim() : 
                  'unknown';

    return {
      postId,
      title,
      url: window.location.href,
      subreddit,
      author
    };
  } catch (error) {
    console.error('Error extracting post data:', error);
    return null;
  }
}

function trackVote(postData, voteType) {
  if (!authToken) {
    showNotification('Please login to track votes');
    return;
  }

  fetch(`${API_BASE_URL}/posts/${postData.postId}/is-tracked`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    }
  })
  .then(response => response.json())
  .then(isTracked => {
    if (isTracked) {
      recordVote(postData, voteType);
    } else {
      console.log('Post not being tracked, skipping vote recording');
    }
  })
  .catch(error => {
    console.error('Error checking if post is tracked:', error);
  });
}

function recordVote(postData, voteType) {
  const voteData = {
    postId: postData.postId,
    postTitle: postData.title,
    postUrl: postData.url,
    subreddit: postData.subreddit,
    username: currentUser.redditUsername || currentUser.username,
    voteType: voteType,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ipAddress: 'client-side'
  };

  fetch(`${API_BASE_URL}/votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(voteData)
  })
  .then(response => {
    if (response.status === 401) {
      showNotification('Please login to track votes');
      return;
    }
    return response.json();
  })
  .then(data => {
    if (data) {
      console.log('Vote tracked successfully:', data);
      showNotification(`${voteType} tracked for "${postData.title}"`);
    }
  })
  .catch(error => {
    console.error('Error tracking vote:', error);
    showNotification('Error tracking vote');
  });
}

function showRedditConsentPrompt(redditId) {
  const redditUsername = extractRedditUsername();
  const redditData = extractRedditProfileData();
  
  const consentDialog = document.createElement('div');
  consentDialog.id = 'reddit-consent-dialog';
  consentDialog.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  consentDialog.innerHTML = `
    <div style="background: white; border-radius: 8px; padding: 24px; max-width: 500px; margin: 20px;">
      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111;">
        🔗 Link Your Reddit Account
      </h2>
      <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
        TrueVotter would like to link your Reddit account to track votes on your posts. 
        The following information will be stored:
      </p>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <div style="margin-bottom: 8px;"><strong>Username:</strong> ${redditUsername || 'Not detected'}</div>
        <div style="margin-bottom: 8px;"><strong>User ID:</strong> ${redditId}</div>
        <div style="margin-bottom: 8px;"><strong>Avatar:</strong> ${redditData.avatar ? 'Yes' : 'Not available'}</div>
        <div><strong>Account Info:</strong> Karma, creation date, verification status</div>
      </div>
      <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
        This data helps identify your posts and provide accurate vote tracking. You can revoke this connection anytime in your dashboard.
      </p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="reddit-consent-deny" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Cancel
        </button>
        <button id="reddit-consent-allow" style="padding: 8px 16px; background: #ff4500; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
          Allow & Link Account
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(consentDialog);
  
  document.getElementById('reddit-consent-allow').addEventListener('click', () => {
    document.body.removeChild(consentDialog);
    showLoadingState('Linking Reddit account...');
    linkRedditAccountWithConsent(redditId, redditUsername, redditData);
  });
  
  document.getElementById('reddit-consent-deny').addEventListener('click', () => {
    document.body.removeChild(consentDialog);
    showNotification('Reddit account linking cancelled');
  });
}

function extractRedditProfileData() {
  try {
    const avatarImg = document.querySelector('img[alt*="avatar"], img[src*="avatar"], .ProfileHeader img');
    const avatarUrl = avatarImg ? avatarImg.src : null;
    
    const karmaElement = document.querySelector('[data-testid="karma"], .karma, .ProfileHeader-karma');
    const karma = karmaElement ? parseInt(karmaElement.textContent.replace(/[^\d]/g, '')) : null;
    
    const createdElement = document.querySelector('[data-testid="created"], .ProfileHeader-created');
    const accountCreated = createdElement ? new Date(createdElement.textContent) : null;
    
    const verifiedElement = document.querySelector('.verified, [data-testid="verified"]');
    const verified = !!verifiedElement;
    
    return {
      avatar: avatarUrl,
      karma: karma,
      accountCreated: accountCreated,
      verified: verified
    };
  } catch (error) {
    console.error('Error extracting Reddit profile data:', error);
    return {};
  }
}

function linkRedditAccountWithConsent(redditId, redditUsername, profileData) {
  if (!redditUsername) return;

  const linkData = {
    redditUsername,
    redditId,
    redditAvatarUrl: profileData.avatar,
    redditKarma: profileData.karma,
    redditAccountCreated: profileData.accountCreated?.toISOString(),
    redditVerified: profileData.verified
  };

  fetch(`${API_BASE_URL}/auth/link-reddit`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(linkData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Reddit account linked:', data);
    hideLoadingState();
    showNotification('Reddit account linked successfully');
    
    currentUser.redditUsername = redditUsername;
    currentUser.redditId = redditId;
    currentUser.isRedditLinked = true;
    
    chrome.storage.sync.set({ 
      currentUser,
      isLinkingReddit: false,
      linkingTabId: null
    });
  })
  .catch(error => {
    console.error('Error linking Reddit account:', error);
    hideLoadingState();
    showNotification('Error linking Reddit account. Please try again.');
  });
}

function linkRedditAccount(redditId) {
  const redditUsername = extractRedditUsername();
  
  if (!redditUsername) return;

  fetch(`${API_BASE_URL}/auth/link-reddit`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      redditUsername,
      redditId
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Reddit account linked:', data);
    hideLoadingState();
    showNotification('Reddit account linked successfully');
    chrome.storage.sync.set({ firstLaunch: false });
  })
  .catch(error => {
    console.error('Error linking Reddit account:', error);
    hideLoadingState();
    showNotification('Error linking Reddit account. Please try again.');
  });
}

function extractRedditUsername() {
  const usernameMatch = window.location.pathname.match(/\/user\/([^\/]+)/);
  if (usernameMatch && usernameMatch[1] !== 'me') {
    return usernameMatch[1];
  }
  
  const profileElement = document.querySelector('p.m-0.text-14.text-neutral-content-weak.font-semibold');
  if (profileElement && profileElement.textContent.includes('u/')) {
    const match = profileElement.textContent.match(/u\/([^\s]+)/);
    return match ? match[1] : null;
  }
  
  const userElement = document.querySelector('[data-testid="user-menu-button"]') ||
                     document.querySelector('.header-user-dropdown');
  
  if (userElement) {
    const usernameText = userElement.textContent || userElement.getAttribute('aria-label');
    if (usernameText) {
      const match = usernameText.match(/u\/([^\s]+)/);
      return match ? match[1] : null;
    }
  }
  
  return null;
}

function checkPostOwnership() {
  const insightsLink = document.querySelector('a[href*="/poststats/"]');
  if (insightsLink) {
    const postIdMatch = insightsLink.href.match(/\/poststats\/([^\/]+)/);
    if (postIdMatch) {
      const postId = postIdMatch[1];
      showPostTrackingUI(postId);
    }
  }
}

function showPostTrackingUI(postId) {
  if (!authToken) return;

  fetch(`${API_BASE_URL}/posts/${postId}/is-owner`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    }
  })
  .then(response => response.json())
  .then(isOwner => {
    if (isOwner) {
      addPostTrackingButton(postId);
    }
  })
  .catch(error => {
    console.error('Error checking post ownership:', error);
  });
}

function addPostTrackingButton(postId) {
  if (document.querySelector('.vote-tracker-button')) return;

  const button = document.createElement('button');
  button.className = 'vote-tracker-button';
  button.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #ff4500;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  button.textContent = 'Track This Post';
  
  button.addEventListener('click', () => {
    addPostToTracking(postId);
  });
  
  document.body.appendChild(button);
}

function addPostToTracking(postId) {
  const postData = extractPostDataFromPage(postId);
  if (!postData) return;

  fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(postData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Post added to tracking:', data);
    showNotification('Post added to tracking');
    
    const button = document.querySelector('.vote-tracker-button');
    if (button) {
      button.textContent = 'Tracking Active';
      button.style.background = '#46d160';
    }
  })
  .catch(error => {
    console.error('Error adding post to tracking:', error);
    showNotification('Error adding post to tracking');
  });
}

function extractPostData(element) {
  try {
    const postElement = element.closest('[data-testid="post-container"]') || 
                       element.closest('.Post') || 
                       element.closest('[data-click-id="body"]');
    
    if (!postElement) return null;

    const titleElement = postElement.querySelector('h3') || 
                        postElement.querySelector('[data-testid="post-content"] h3') ||
                        postElement.querySelector('.title a');
    
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown Post';
    
    const linkElement = postElement.querySelector('a[data-click-id="body"]') ||
                       postElement.querySelector('.title a') ||
                       titleElement;
    
    const postUrl = linkElement ? linkElement.href : window.location.href;
    
    const postIdMatch = postUrl.match(/\/comments\/([a-zA-Z0-9]+)/);
    const postId = postIdMatch ? postIdMatch[1] : Math.random().toString(36).substr(2, 9);
    
    const subredditMatch = window.location.pathname.match(/\/r\/([^\/]+)/);
    const subreddit = subredditMatch ? subredditMatch[1] : 'unknown';
    
    const authorElement = postElement.querySelector('[data-testid="post_author_link"]') ||
                         postElement.querySelector('.author') ||
                         postElement.querySelector('a[href*="/user/"]');
    
    const author = authorElement ? 
                  authorElement.textContent.replace(/^u\//, '').trim() : 
                  'unknown';

    return {
      postId,
      title,
      url: postUrl,
      subreddit,
      author
    };
  } catch (error) {
    console.error('Error extracting post data:', error);
    return null;
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4500;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function initVoteTracking() {
  checkPostOwnership();
  
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        shouldUpdate = true;
      }
    });
    
    if (shouldUpdate) {
      setTimeout(() => {
        checkPostOwnership();
      }, 500);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVoteTracking);
} else {
  initVoteTracking();
}

setTimeout(initVoteTracking, 2000);

function handleFirstLaunchProfileDetection() {
  console.log('First launch profile detection started');
  
  setTimeout(() => {
    const redditUsername = extractRedditUsername();
    if (redditUsername && authToken && currentUser) {
      console.log('First launch: Reddit username detected:', redditUsername);
      showNotification('Setting up Reddit integration...');
    }
  }, 2000);
}

function showLoadingState(message) {
  const loader = document.createElement('div');
  loader.id = 'reddit-tracker-loader';
  loader.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9); color: white; padding: 30px;
    border-radius: 12px; z-index: 10001; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-align: center; min-width: 300px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  `;
  loader.innerHTML = `
    <div style="font-size: 16px; font-weight: 600; margin-bottom: 15px;">🔗 Linking Reddit Account</div>
    <div id="loading-progress" style="font-size: 14px; margin-bottom: 15px;">${message}</div>
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="width: 20px; height: 20px; border: 2px solid #ff4500; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(loader);
  
  preventNavigation();
}

function hideLoadingState() {
  const loader = document.getElementById('reddit-tracker-loader');
  if (loader) loader.remove();
  allowNavigation();
}

function updateLinkingProgress(message) {
  const progressElement = document.getElementById('loading-progress');
  if (progressElement) {
    progressElement.textContent = message;
  }
}

function preventNavigation() {
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('popstate', handlePopState);
}

function allowNavigation() {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('popstate', handlePopState);
}

function handleBeforeUnload(e) {
  e.preventDefault();
  e.returnValue = 'Reddit account linking is in progress. Are you sure you want to leave?';
  return e.returnValue;
}

function handlePopState(e) {
  e.preventDefault();
  showNotification('Please wait for Reddit account linking to complete');
}

function handleRedditLinkingFlow() {
  showLoadingState('Waiting for page to fully load...');
  
  setTimeout(() => {
    updateLinkingProgress('Checking if you are on your own profile...');
    
    if (window.location.pathname === '/user/me' || window.location.pathname.includes('/user/me/')) {
      updateLinkingProgress('Waiting for Reddit user data...');
    } else {
      const username = extractRedditUsername();
      if (username) {
        updateLinkingProgress('Verifying profile ownership...');
      } else {
        updateLinkingProgress('Unable to detect profile. Please ensure you are on your Reddit profile page.');
      }
    }
  }, 2000);
}

function verifyOwnProfile(extractedUsername) {
  if (window.location.pathname === '/user/me' || window.location.pathname.includes('/user/me/')) {
    return true;
  }
  
  const urlUsername = window.location.pathname.match(/\/user\/([^\/]+)/);
  if (urlUsername && urlUsername[1] === extractedUsername) {
    return true;
  }
  
  return false;
}

function showProfileVerificationError() {
  hideLoadingState();
  
  const errorDialog = document.createElement('div');
  errorDialog.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  errorDialog.innerHTML = `
    <div style="background: white; border-radius: 8px; padding: 24px; max-width: 400px; margin: 20px; text-align: center;">
      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #dc3545;">
        ⚠️ Profile Verification Failed
      </h2>
      <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
        You must be on your own Reddit profile page to link your account. Please visit your profile page and try again.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="go-to-profile" style="padding: 8px 16px; background: #ff4500; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
          Go to My Profile
        </button>
        <button id="cancel-linking" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Cancel
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(errorDialog);
  
  document.getElementById('go-to-profile').addEventListener('click', () => {
    window.location.href = 'https://www.reddit.com/user/me';
  });
  
  document.getElementById('cancel-linking').addEventListener('click', () => {
    document.body.removeChild(errorDialog);
    chrome.storage.sync.set({ 
      isLinkingReddit: false,
      linkingTabId: null
    });
    showNotification('Reddit account linking cancelled');
  });
}

function showEnhancedRedditConsentPrompt(redditId, redditUsername) {
  hideLoadingState();
  const redditData = extractRedditProfileData();
  
  const consentDialog = document.createElement('div');
  consentDialog.id = 'reddit-consent-dialog';
  consentDialog.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  consentDialog.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 32px; max-width: 550px; margin: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #111; display: flex; align-items: center; gap: 8px;">
        🔗 Link Your Reddit Account
      </h2>
      <p style="color: #666; margin-bottom: 24px; line-height: 1.6;">
        TrueVotter has successfully gathered your Reddit account information. The following data will be securely stored to enable vote tracking on your posts:
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #ff4500;">
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #333;">Reddit Username:</span>
          <span style="color: #ff4500; font-weight: 500;">u/${redditUsername}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #333;">User ID:</span>
          <span style="font-family: monospace; font-size: 12px; color: #666;">${redditId}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #333;">Profile Avatar:</span>
          <span style="color: ${redditData.avatar ? '#28a745' : '#6c757d'};">${redditData.avatar ? '✓ Available' : 'Not available'}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #333;">Karma Points:</span>
          <span style="color: #ff4500; font-weight: 500;">${redditData.karma || 'Not available'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #333;">Account Status:</span>
          <span style="color: ${redditData.verified ? '#28a745' : '#6c757d'};">${redditData.verified ? '✓ Verified' : 'Standard'}</span>
        </div>
      </div>
      <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>Privacy Notice:</strong> This information helps us identify your posts and provide accurate vote tracking analytics. You can revoke this connection at any time through your dashboard settings.
        </p>
      </div>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="reddit-consent-deny" style="padding: 12px 20px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;">
          Decline & Sign Out
        </button>
        <button id="reddit-consent-allow" style="padding: 12px 20px; background: #ff4500; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
          Accept & Link Account
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(consentDialog);
  
  document.getElementById('reddit-consent-allow').addEventListener('click', () => {
    document.body.removeChild(consentDialog);
    showLoadingState('Linking Reddit account to your TrueVotter profile...');
    linkRedditAccountWithConsent(redditId, redditUsername, redditData);
  });
  
  document.getElementById('reddit-consent-deny').addEventListener('click', () => {
    document.body.removeChild(consentDialog);
    handleConsentDecline();
  });
}

function handleConsentDecline() {
  showLoadingState('Signing you out...');
  
  setTimeout(() => {
    chrome.storage.sync.clear(() => {
      hideLoadingState();
      showNotification('You have been signed out. Reddit account linking was declined.');
      
      setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.update(tabs[0].id, {url: chrome.runtime.getURL('popup.html')});
        });
      }, 2000);
    });
  }, 1000);
}
