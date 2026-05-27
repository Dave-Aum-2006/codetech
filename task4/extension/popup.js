const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:8080';

// DOM Elements
const loginView = document.getElementById('login-view');
const trackerView = document.getElementById('tracker-view');
const logoutBtn = document.getElementById('logout-icon-btn');
const subHeaderText = document.getElementById('sub-header');
const alertBox = document.getElementById('alert-box');

// Login form fields
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

// Tracker fields
const currentDomainText = document.getElementById('current-domain');
const currentTimerText = document.getElementById('current-timer');
const focusScoreText = document.getElementById('focus-score-pct');
const focusScoreFill = document.getElementById('focus-score-fill');
const blockToggle = document.getElementById('block-domain-toggle');

// Action buttons
const openDashboardBtn = document.getElementById('open-dashboard-btn');
const syncNowBtn = document.getElementById('sync-now-btn');

let activeInterval = null;
let currentActiveDomain = null;

// Helper: Show error alert
function showAlert(message) {
  alertBox.innerText = message;
  alertBox.style.display = 'block';
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}

// Format duration to HH:MM:SS
function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

// Fetch stats and update UI progress bars
async function fetchStats(token) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/activity/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.summary) {
        const score = data.summary.focusScore || 0;
        focusScoreText.innerText = `${score}%`;
        focusScoreFill.style.width = `${score}%`;
      }
    }
  } catch (e) {
    console.error('Failed to fetch stats', e);
  }
}

// Check auth state and initialize view
async function init() {
  const storage = await chrome.storage.local.get(['token', 'user', 'blockedDomains']);
  const token = storage.token;
  const user = storage.user;

  if (token && user) {
    // Authenticated
    loginView.classList.add('hidden');
    trackerView.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    subHeaderText.innerText = `Logged in: ${user.username}`;
    
    // Fetch latest statistics
    fetchStats(token);
    
    // Start active tracking stopwatch updates
    startTimerLoop();
    
    // Setup block toggle for active domain
    setupBlockToggle(storage.blockedDomains || []);
  } else {
    // Unauthenticated
    loginView.classList.remove('hidden');
    trackerView.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    subHeaderText.innerText = 'Sign in to sync logs';
    stopTimerLoop();
  }
}

// Timer loop that queries background.js for the active session duration
function startTimerLoop() {
  stopTimerLoop();
  
  const updateTimer = () => {
    chrome.runtime.sendMessage({ action: 'getActiveSession' }, (response) => {
      if (chrome.runtime.lastError) {
        // Service worker might be sleeping/loading
        return;
      }
      
      if (response && response.domain) {
        currentActiveDomain = response.domain;
        currentDomainText.innerText = response.domain;
        currentTimerText.innerText = formatTime(response.duration);
        
        // Refresh block toggle active checkbox matching
        chrome.storage.local.get(['blockedDomains'], (res) => {
          const list = res.blockedDomains || [];
          blockToggle.checked = list.includes(response.domain);
        });
      } else {
        currentActiveDomain = null;
        currentDomainText.innerText = 'No Active Website';
        currentTimerText.innerText = '00:00:00';
        blockToggle.checked = false;
      }
    });
  };
  
  updateTimer();
  activeInterval = setInterval(updateTimer, 1000);
}

function stopTimerLoop() {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
}

// Setup the block toggle listener
function setupBlockToggle(blockedDomains) {
  blockToggle.onchange = async () => {
    if (!currentActiveDomain) {
      blockToggle.checked = false;
      showAlert('No active website to block.');
      return;
    }

    const storage = await chrome.storage.local.get(['token', 'blockedDomains']);
    const token = storage.token;
    let list = storage.blockedDomains || [];

    if (blockToggle.checked) {
      if (!list.includes(currentActiveDomain)) {
        list.push(currentActiveDomain);
      }
    } else {
      list = list.filter(d => d !== currentActiveDomain);
    }

    // Save locally
    await chrome.storage.local.set({ blockedDomains: list });

    // Sync to backend DB
    if (token) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ blockedDomains: list })
        });
        
        if (!response.ok) {
          console.error('Failed to save blocklist to DB');
        }
      } catch (e) {
        console.error('Failed to connect to backend setting updater', e);
      }
    }
  };
}

// Action: Login Form Submit
loginBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showAlert('Please fill in all fields.');
    return;
  }

  loginBtn.innerText = 'Connecting...';
  loginBtn.disabled = true;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Save credentials and settings
      await chrome.storage.local.set({
        token: data.token,
        user: {
          username: data.username,
          email: data.email
        },
        blockedDomains: data.settings?.blockedDomains || [],
        customClassifications: data.settings?.customClassifications || {}
      });
      
      emailInput.value = '';
      passwordInput.value = '';
      init();
    } else {
      showAlert(data.message || 'Login failed.');
    }
  } catch (e) {
    showAlert('Could not connect to authentication server.');
  } finally {
    loginBtn.innerText = 'Sign In';
    loginBtn.disabled = false;
  }
};

// Action: Manual Background Synchronizer Force Trigger
syncNowBtn.onclick = () => {
  syncNowBtn.style.transform = 'scale(0.9) rotate(360deg)';
  syncNowBtn.style.transition = 'transform 0.5s ease';
  
  chrome.runtime.sendMessage({ action: 'syncNow' }, (res) => {
    setTimeout(() => {
      syncNowBtn.style.transform = 'none';
      syncNowBtn.style.transition = 'none';
    }, 500);

    if (res && res.success) {
      chrome.storage.local.get(['token'], (data) => {
        if (data.token) fetchStats(data.token);
      });
    } else {
      showAlert('Sync failed. Check connection.');
    }
  });
};

// Action: Open SaaS web dashboard in new tab
openDashboardBtn.onclick = () => {
  chrome.tabs.create({ url: FRONTEND_URL });
};

// Action: Logout
logoutBtn.onclick = async () => {
  await chrome.storage.local.clear();
  init();
};

// Start
document.addEventListener('DOMContentLoaded', init);
