let openedTabId = null; // Store the tab ID

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const subscribeUrl = "http://localhost:3000/subscribe/create-checkout-session";
  const signinUrl = "http://localhost:3000/signin";
  const dashboardUrl = "http://localhost:3000/dashboard";
  const data = {};

  if (message.action === 'openSubsPage') {
    sendPostRequest(subscribeUrl, message.data, sendResponse);
  } else if (message.action === 'opensigninPage') {
    openTab(signinUrl, sendResponse);
  } else if (message.action === 'openDashboard') {
    openTab(dashboardUrl, sendResponse);
  }
  return true;
});
// Function to send a POST request and handle the JSON response
async function sendPostRequest(url, data, sendResponse) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
    }

    const responseData = await response.json(); // Parse JSON response
    if (responseData.url) {
      // Redirect to the URL received from the server
      openTab(responseData.url,sendResponse);
    } else {
      console.error('Unexpected response data:', responseData);
    }
  } catch (err) {
    console.error('Error during POST request:', err);
    sendResponse({ status: 'Error', message: err.message });
  }
}
// Function to handle tab creation and reuse
function openTab(url, sendResponse) {
  if (openedTabId) {
    // Check if the tab is still open
    chrome.tabs.get(openedTabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        // If the tab is closed or not accessible, open a new one
        createTab(url, sendResponse);
      } else {
        // If the tab is open, update its URL and focus it
        chrome.tabs.update(openedTabId, { url, active: true });
        sendResponse({ status: "Updated existing tab" });
      }
    });
  } else {
    // Create a new tab
    createTab(url, sendResponse);
  }
}

// Helper function to create a new tab
function createTab(url, sendResponse) {
  chrome.tabs.create({ url, active: true }, (tab) => {
    openedTabId = tab.id;
    sendResponse({ status: "Success", tabId: openedTabId });
  });
}

// Listen for tab close event to reset openedTabId
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === openedTabId) {
    openedTabId = null;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
