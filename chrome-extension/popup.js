const API_BASE_URL = 'http://localhost:8000';
let authToken = null;
let currentUser = null;

async function checkAuthStatus() {
  const result = await chrome.storage.sync.get(['authToken', 'currentUser']);
  authToken = result.authToken;
  currentUser = result.currentUser;
  
  if (authToken && currentUser) {
    showAuthenticatedView();
    loadStats();
  } else {
    showLoginView();
  }
}

function showLoginView() {
  document.body.innerHTML = `
    <div style="width: 350px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; color: #ff4500; margin-bottom: 5px;">Reddit Vote Tracker</div>
        <div style="color: #666; font-size: 14px;">Please login to continue</div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <input type="email" id="email" placeholder="Email" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px; box-sizing: border-box;">
        <input type="password" id="password" placeholder="Password" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 15px; box-sizing: border-box;">
        
        <button id="loginBtn" style="width: 100%; padding: 12px; background: #09090b; color: #fafafa; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 10px; transition: background-color 0.2s;">
          Login
        </button>
        
        <button id="registerBtn" style="width: 100%; padding: 12px; background: #f4f4f5; color: #09090b; border: 1px solid #e4e4e7; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">
          Register
        </button>
      </div>
      
      <div id="errorMessage" style="color: #dc3545; font-size: 12px; text-align: center; margin-top: 10px; display: none;"></div>
    </div>
  `;
  
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('registerBtn').addEventListener('click', handleRegister);
  
  document.getElementById('email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

function showAuthenticatedView() {
  document.body.innerHTML = `
    <div style="width: 350px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; color: #ff4500; margin-bottom: 5px;">Reddit Vote Tracker</div>
        <div style="color: #666; font-size: 14px;">Welcome, ${currentUser.username || currentUser.email}</div>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Upvotes Tracked:</span>
          <span id="upvoteCount" style="font-weight: bold; color: #46d160;">0</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Downvotes Tracked:</span>
          <span id="downvoteCount" style="font-weight: bold; color: #ff4500;">0</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">Total Votes:</span>
          <span id="totalCount" style="font-weight: bold;">0</span>
        </div>
      </div>
      
      <div id="status" style="padding: 10px; border-radius: 6px; font-size: 14px; text-align: center; margin-bottom: 15px;"></div>
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${!currentUser.redditUsername ? `
          <button id="linkRedditBtn" style="width: 100%; padding: 12px; background: #ff4500; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 5px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            🔗 Link Reddit Account
          </button>
        ` : ''}
        <div style="display: flex; gap: 10px;">
          <button id="openDashboard" style="flex: 1; padding: 10px; background: #09090b; color: #fafafa; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">
            Open Dashboard
          </button>
          <button id="logoutBtn" style="flex: 1; padding: 10px; background: #ef4444; color: #fafafa; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
            Logout
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });
  
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  if (!currentUser.redditUsername) {
    document.getElementById('linkRedditBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://www.reddit.com/user/me' });
      showNotification('Visit your Reddit profile to link your account');
    });
  }
}

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.access_token;
      currentUser = data.user;
      
      await chrome.storage.sync.set({
        authToken: authToken,
        currentUser: currentUser
      });
      
      showAuthenticatedView();
      loadStats();
      
      if (!currentUser.redditUsername && !currentUser.redditId) {
        chrome.tabs.create({ url: 'https://www.reddit.com/user/me' });
        showNotification('Please visit your Reddit profile to link your account');
      }
    } else {
      showError(data.message || 'Login failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

async function handleRegister() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
        username: email.split('@')[0]
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.access_token;
      currentUser = data.user;
      
      await chrome.storage.sync.set({
        authToken: authToken,
        currentUser: currentUser
      });
      
      showAuthenticatedView();
      loadStats();
      
      if (!currentUser.redditUsername && !currentUser.redditId) {
        chrome.tabs.create({ url: 'https://www.reddit.com/user/me' });
        showNotification('Please visit your Reddit profile to link your account');
      }
    } else {
      showError(data.message || 'Registration failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  }
}

async function handleLogout() {
  await chrome.storage.sync.clear();
  authToken = null;
  currentUser = null;
  showLoginView();
}

function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/votes/my-stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });
    
    if (response.ok) {
      const stats = await response.json();
      
      document.getElementById('upvoteCount').textContent = stats.upvotes || 0;
      document.getElementById('downvoteCount').textContent = stats.downvotes || 0;
      document.getElementById('totalCount').textContent = stats.totalVotes || 0;
      
      const statusElement = document.getElementById('status');
      statusElement.className = 'status active';
      statusElement.style.background = '#d4edda';
      statusElement.style.color = '#155724';
      statusElement.textContent = '✓ Extension Active - Vote tracking enabled';
    } else {
      throw new Error('Failed to load stats');
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    
    const statusElement = document.getElementById('status');
    statusElement.style.background = '#f8d7da';
    statusElement.style.color = '#721c24';
    statusElement.textContent = '⚠ Cannot connect to backend server';
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 10px; right: 10px; background: #ff4500; color: white;
    padding: 10px; border-radius: 6px; font-size: 12px; z-index: 10000;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});
