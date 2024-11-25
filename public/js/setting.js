// Attach event listener for subscription button
document.addEventListener('DOMContentLoaded', () => {
    const buySubscriptionButton = document.getElementById('buySubscription');

    if (buySubscriptionButton) {
        console.log("Clicked");
        buySubscriptionButton.addEventListener('click', () => {
            // Send a message to the background script to open the subscription page
            chrome.runtime.sendMessage({ action: 'openSigninPage' });
        });
    }
});

// document.addEventListener("DOMContentLoaded", () => {
//     const switchElement = document.getElementById("enableExtensionSwitch");
  
//     // Load saved state from Chrome's storage
//     chrome.storage.sync.get("extensionEnabled", (data) => {
//       switchElement.checked = data.extensionEnabled || false;
//     });
  
//     // Handle switch toggle
//     switchElement.addEventListener("change", () => {
//       const isEnabled = switchElement.checked;
  
//       // Save state in Chrome's storage
//       chrome.storage.sync.set({ extensionEnabled: isEnabled });
  
//       // Send a message to the content script to enable/disable DOM monitoring
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.tabs.sendMessage(tabs[0].id, { action: isEnabled ? "enable" : "disable" });
//       });
//     });
//   });
  