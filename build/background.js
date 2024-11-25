chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSigninPage') {
      chrome.windows.create({
          url: "http://localhost:3000/signin",
          type: "popup",
          state: "normal", // Change to "fullscreen" if needed
          width: 800,
          height: 600
      });
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
