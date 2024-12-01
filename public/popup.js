document.addEventListener('DOMContentLoaded', () => {
    const buySubscriptionButton = document.getElementById('buySubscription');
    const signin = document.getElementById('signin');

    if (buySubscriptionButton) {
        buySubscriptionButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openSubsPage' }, (response) => {
            });
        });
    }

    if (signin) {
        signin.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'opensigninPage' }, (response) => {
            });
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
  