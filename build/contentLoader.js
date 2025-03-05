let initialized = false;
    
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "activateExtension" && !initialized) {
    initialized = true;
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('content.js');
    script.onload = () => {
      // After content.js is loaded, send message to start image collection
      chrome.runtime.sendMessage({ action: "startImageCollection" });
    };
    document.head.appendChild(script);
  }
});
