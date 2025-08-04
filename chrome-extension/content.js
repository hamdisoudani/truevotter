console.log('Reddit Vote Tracker: Content script loaded');

const API_BASE_URL = 'http://localhost:8000';
let authToken = null;
let currentUser = null;
let redditUserId = null;

chrome.storage.sync.get(['authToken', 'currentUser'], (result) => {
  authToken = result.authToken;
  currentUser = result.currentUser;
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
  
  if (authToken && currentUser) {
    linkRedditAccount(redditId);
  }
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

  const voteData = {
    postId: postData.postId,
    postTitle: postData.title,
    postUrl: postData.url,
    subreddit: postData.subreddit,
    username: postData.author,
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
    showNotification('Reddit account linked successfully');
  })
  .catch(error => {
    console.error('Error linking Reddit account:', error);
  });
}

function extractRedditUsername() {
  const usernameMatch = window.location.pathname.match(/\/user\/([^\/]+)/);
  if (usernameMatch) {
    return usernameMatch[1];
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
