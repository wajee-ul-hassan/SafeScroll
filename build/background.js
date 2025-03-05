let openedTabId = null; // Store the tab ID
let isSubscribed = false;
let username = "";
let isLoggedIn = false;
let isServerCommunicationEnabled = false;
let currentUsername = null;

// Function to store images in chrome storage with timestamp
async function storeImagesLocally(imageUrls, username) {
  try {
    // Get existing stored images
    const result = await chrome.storage.local.get('storedImages');
    const storedImages = result.storedImages || [];

    // Add new images with timestamp
    const newImages = imageUrls.map(url => ({
      url,
      username,
      timestamp: Date.now()
    }));

    // Combine with existing images
    const updatedImages = [...storedImages, ...newImages];

    // Store updated images
    await chrome.storage.local.set({ storedImages: updatedImages });

    console.log('Images stored locally:', newImages.length);
  } catch (error) {
    console.error('Error storing images locally:', error);
  }
}

// Function to clean up expired images (older than 24 hours)
async function cleanupExpiredImages() {
  try {
    const result = await chrome.storage.local.get('storedImages');
    const storedImages = result.storedImages || [];

    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Filter out images older than 24 hours
    const validImages = storedImages.filter(img =>
      (now - img.timestamp) < oneDayInMs
    );

    // Update storage with only valid images
    await chrome.storage.local.set({ storedImages: validImages });

    console.log('Cleaned up expired images. Remaining:', validImages.length);
  } catch (error) {
    console.error('Error cleaning up expired images:', error);
  }
}

// Set up periodic cleanup (every hour)
setInterval(cleanupExpiredImages, 60 * 60 * 1000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const subscribeUrl = "http://localhost:3000/subscribe";
  const signinUrl = "http://localhost:3000/signin";
  const dashboardUrl = "http://localhost:3000/dashboard";
  const logoutUrl = "http://localhost:3000/logout";
  const manageUrl = "http://localhost:3000/manageprofile";
  const data = {};

  if (message.action === 'openSubsPage') {
    openTab(subscribeUrl, sendResponse);
  } else if (message.action === 'opensigninPage') {
    openTab(signinUrl, sendResponse);
  } else if (message.action === 'openDashboard') {
    openTab(dashboardUrl, sendResponse);
  } else if (message.action === 'logout') {
    openTab(logoutUrl, sendResponse);
  } else if (message.action === 'manage') {
    openTab(manageUrl, sendResponse);
  } else if (message.action === "startImageCollection") {
    isSubscribed = message.isSubscribed;
    username = message.username;
    isLoggedIn = true;
    console.log("Image collection started for user:", username, "Subscribed:", isSubscribed);

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        console.error("No active tab.");
        return;
      }

      // Store the tab ID
      openedTabId = tab.id;

      // Check if URL is supported
      const isSupported = tab.url && (tab.url.includes('facebook.com') || tab.url.includes('instagram.com') || tab.url.includes('pinterest.com'));
      if (!isSupported) {
        console.log("Unsupported tab.");
        return;
      }

      // First ensure content script is injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (error) {
        console.error("Script injection failed:", error);
        return;
      }

      const sendWithRetry = (retries = 3) => {
        chrome.tabs.sendMessage(tab.id, { action: "startImageGrabbing", isSubscribed: isSubscribed, username: username }, (response) => {
          if (chrome.runtime.lastError) {
            if (retries > 0) {
              setTimeout(() => sendWithRetry(retries - 1), 1000);
            } else {
              console.error("Failed after retries:", chrome.runtime.lastError.message);
            }
          } else if (response) {
            console.log(response);
          }
        });
      };
      sendWithRetry();
    });
  } else if (message.action === "newImages") {
    console.log("New image URLs detected:", message.imageUrls);
    if (message.imageUrls && isSubscribed) {
      // Store images locally regardless of subscription
      storeImagesLocally(message.imageUrls, message.username);
      // sendToServer(message.imageUrls, message.username);
    }
  } else if (message.action === "stopImageCollection") {
    // Send stop message to content script using stored tab ID
    if (openedTabId) {
      console.log("Stopping image collection in tab:", openedTabId);
      chrome.tabs.sendMessage(openedTabId, { action: "stopImageCollection" });
    } else {
      console.log("No tab ID stored for stopping image collection.");
    }
  }
  return true;
});

async function sendToServer(imageUrls, username) {
  if (!isSubscribed || !username) {
    console.log("User not subscribed or no username provided");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/dashboard/store-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        imageUrls,
        username: username
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    console.log('Images successfully sent to server');
  } catch (error) {
    console.error('Error sending to server:', error);
  }
}

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