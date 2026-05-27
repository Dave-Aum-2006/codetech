let activeTabDomain = null;
let activeTabStartTime = null;
let accumulatedTime = {}; // domain -> seconds

// Helper to extract domain from URL
function getDomain(url) {
  try {
    if (!url) return null;
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.hostname.replace('www.', '');
  } catch (e) {
    return null;
  }
}

// Check and block if domain is in blocked list
async function checkAndBlockTab(tabId, url) {
  const domain = getDomain(url);
  if (!domain) return;

  const storage = await chrome.storage.local.get(['blockedDomains']);
  const list = storage.blockedDomains || [];
  
  if (list.includes(domain)) {
    const blockedPageUrl = chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url);
    chrome.tabs.update(tabId, { url: blockedPageUrl });
  }
}

// Track active page time elapsed
function trackActiveTime() {
  if (activeTabDomain && activeTabStartTime) {
    const elapsed = Math.floor((Date.now() - activeTabStartTime) / 1000);
    if (elapsed > 0) {
      accumulatedTime[activeTabDomain] = (accumulatedTime[activeTabDomain] || 0) + elapsed;
    }
  }
  activeTabStartTime = Date.now();
}

// Switch active tab domain
async function switchActiveDomain(newUrl) {
  trackActiveTime();
  
  const newDomain = getDomain(newUrl);
  if (newDomain) {
    activeTabDomain = newDomain;
    activeTabStartTime = Date.now();
  } else {
    activeTabDomain = null;
    activeTabStartTime = null;
  }
}

// Listen for tab focus/activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      await checkAndBlockTab(activeInfo.tabId, tab.url);
      await switchActiveDomain(tab.url);
    }
  } catch (e) {
    // Tab info might not be available immediately
  }
});

// Listen for tab URL updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    await checkAndBlockTab(tabId, changeInfo.url);
    
    // Only switch domain tracking if it is the currently active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id === tabId) {
      await switchActiveDomain(changeInfo.url);
    }
  }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus, pause tracking
    trackActiveTime();
    activeTabDomain = null;
    activeTabStartTime = null;
  } else {
    // Regained focus, resume tracking active tab
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, windowId: windowId });
      if (activeTab && activeTab.url) {
        await checkAndBlockTab(activeTab.id, activeTab.url);
        await switchActiveDomain(activeTab.url);
      }
    } catch (e) {
      // Handle edge cases where tab query fails
    }
  }
});

// Synchronize profile settings and upload logged activity times
async function syncLogs() {
  trackActiveTime(); // Update tracker for current session

  const data = await chrome.storage.local.get(['token']);
  const token = data.token;
  if (!token) return;

  // 1. Sync logged times to server
  const domainsToSync = Object.keys(accumulatedTime).filter(d => accumulatedTime[d] > 0);
  if (domainsToSync.length > 0) {
    for (const domain of domainsToSync) {
      const duration = accumulatedTime[domain];
      try {
        const response = await fetch('http://localhost:8000/api/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ domain, duration })
        });

        if (response.ok) {
          accumulatedTime[domain] -= duration;
        }
      } catch (e) {
        console.error('Failed to sync domain activity', domain, e);
      }
    }
  }

  // 2. Fetch latest user settings from server (blocked domains, classifications)
  try {
    const profileRes = await fetch('http://localhost:8000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile && profile.settings) {
        await chrome.storage.local.set({
          blockedDomains: profile.settings.blockedDomains || [],
          customClassifications: profile.settings.customClassifications || {}
        });
      }
    }
  } catch (e) {
    console.error('Failed to fetch user settings profile', e);
  }
}

// Alarm to trigger syncs every 15 seconds
chrome.alarms.create('syncLogsAlarm', { periodInMinutes: 0.25 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncLogsAlarm') {
    syncLogs();
  }
});

// Listen for instant messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'syncNow') {
    syncLogs().then(() => sendResponse({ success: true }));
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'getActiveSession') {
    let duration = 0;
    if (activeTabDomain && activeTabStartTime) {
      duration = (accumulatedTime[activeTabDomain] || 0) + Math.floor((Date.now() - activeTabStartTime) / 1000);
    }
    sendResponse({
      domain: activeTabDomain,
      duration: duration
    });
    return false;
  }
});
