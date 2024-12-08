let openedTabId = null; // Store the tab ID

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const subscribeUrl = "http://localhost:3000/subscribe";
  const signinUrl = "http://localhost:3000/signin";
  const dashboardUrl = "http://localhost:3000/dashboard";
  const logoutUrl = "http://localhost:3000/logout";
  const data = {};

  if (message.action === 'openSubsPage') {
    openTab(subscribeUrl, sendResponse);
  } else if (message.action === 'opensigninPage') {
    openTab(signinUrl, sendResponse);
  } else if (message.action === 'openDashboard') {
    openTab(dashboardUrl, sendResponse);
  } else if (message.action === 'logout') {
    openTab(logoutUrl, sendResponse);
  }
  return true;
});

// Function to handle tab creation and reuse
function openTab(url, sendResponse) {
  if (url.endsWith("/logout")) {
    fetch(url, { method: "GET", credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            console.error("Logout failed:", errorData);
            sendResponse({ success: false, error: errorData.error });
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.message) {
          console.log("Logout successful:", data.message);
          //redirect to a sign-in page in a new tab
          const signinUrl = "http://localhost:3000/signin";
          if (openedTabId) {
            // Close the existing tab
            chrome.tabs.remove(openedTabId, () => {
              if (chrome.runtime.lastError) {
                console.error("Failed to close existing tab:", chrome.runtime.lastError.message);
              }
              createTab(signinUrl, sendResponse);
            });
          } else {
            // Create a new tab directly
            createTab(signinUrl, sendResponse);
          }
          sendResponse({ success: true, message: data.message });
        }
      })
      .catch((error) => {
        console.error("An error occurred during logout:", error);
        sendResponse({ success: false, error: "An unexpected error occurred" });
      });
  }
  else {
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
