// Helper function to extract image URLs from the page
function extractImageUrls() {
    const images = Array.from(document.querySelectorAll("img"));
    return images.map(img => img.src).filter(src => src && src.trim() !== "");
  }
  
  // Install the MutationObserver only once.
  if (!window.observerInitialized) {
    window.observerInitialized = true;
    
    const observer = new MutationObserver(mutations => {
      let newImages = [];
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // If the node itself is an image
              if (node.tagName === "IMG" && node.src && node.src.trim() !== "") {
                newImages.push(node.src);
              }
              // Also check if the node contains any <img> elements
              else {
                const imgs = node.querySelectorAll("img");
                imgs.forEach(img => {
                  if (img.src && img.src.trim() !== "") {
                    newImages.push(img.src);
                  }
                });
              }
            }
          });
        }
      }
      if (newImages.length > 0) {
        // Send newly found image URLs to the background script.
        chrome.runtime.sendMessage({ action: "newImages", imageUrls: newImages });
      }
    });
    
    // Start observing changes in the entire document body.
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Listen for a message from background.js to return the initial list of image URLs.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getImages") {
      const imageUrls = extractImageUrls();
      sendResponse({ imageUrls });
    }
  });
  