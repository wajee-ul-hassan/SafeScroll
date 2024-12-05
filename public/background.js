let openedTabId = null; // Store the tab ID

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const subscribeUrl = "http://localhost:3000/subscribe";
  const signinUrl = "http://localhost:3000/signin";

  if (message.action === 'openSubsPage') {
    openTab(subscribeUrl, sendResponse);
  } else if (message.action === 'opensigninPage') {
    openTab(signinUrl, sendResponse);
  }
  return true;
});

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

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "processImages" && message.data) {
//     console.log("Received image URLs from content script:", message.data);
//     // Send image URLs to your model for analysis (API call logic here)
//     // Example: 
//     // fetch("http://your-model-endpoint.com/analyze", {
//     //   method: "POST",
//     //   headers: { "Content-Type": "application/json" },
//     //   body: JSON.stringify({ images: message.data })
//     // });
//   }
// });
