// let isMonitoring = false;

// // Function to extract image URLs from the DOM
// function extractImageURLs() {
//   const images = document.querySelectorAll("img");
//   const imageURLs = Array.from(images).map((img) => img.src);

//   // Send the image URLs to the background script for processing
//   chrome.runtime.sendMessage({ action: "processImages", data: imageURLs });
// }

// // Listener for messages from the popup or background
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "enable") {
//     if (!isMonitoring) {
//       isMonitoring = true;
//       console.log("SafeScroll enabled");
//       extractImageURLs();
//       // Optional: Set up a MutationObserver to monitor DOM changes
//     }
//   } else if (message.action === "disable") {
//     if (isMonitoring) {
//       isMonitoring = false;
//       console.log("SafeScroll disabled");
//     }
//   }
// });
