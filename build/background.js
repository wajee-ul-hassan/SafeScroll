let popupWindowId = null; // Store the popup window ID

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const popupConfig = {
    type: "popup",
    width: 800,
    height: 600,
  };

  if (message.action === 'openSubsPage') {
    const url = "http://localhost:3000/subscribe";
    handlePopup(url, popupConfig, sendResponse);
  } else if (message.action === 'opensigninPage') {
    const url = "http://localhost:3000/signin";
    handlePopup(url, popupConfig, sendResponse);
  }
});

// Function to handle popup creation and reuse
function handlePopup(url, config, sendResponse) {
  if (popupWindowId) {
    // Update the existing popup window
    chrome.windows.update(popupWindowId, { focused: true }, () => {
      chrome.tabs.query({ windowId: popupWindowId }, (tabs) => {
        if (tabs && tabs.length > 0) {
          // Update the URL of the first tab in the popup
          chrome.tabs.update(tabs[0].id, { url });
        }
      });
    });
  } else {
    // Create a new popup window
    chrome.windows.create({ ...config, url }, (window) => {
      popupWindowId = window.id;
      console.log("Popup window created with ID:", popupWindowId);
    });
  }

  sendResponse({ status: "Success" });
}

// Listen for window close event to reset popupWindowId
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
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
