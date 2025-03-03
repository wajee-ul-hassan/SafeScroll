// Add this at the beginning of content.js
console.log('Content script loaded');

// Constants for batch processing
const MAX_BATCH_SIZE = 50; // Maximum number of images to send at once
const BATCH_TIMEOUT = 3000; // 3 seconds timeout

// Track processed images
const processedImages = new Set();

// Debounce function to limit how often we send messages
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Helper function to extract image URLs from the page
function extractImageUrls() {
    const images = Array.from(document.querySelectorAll("img"));
    return images.map(img => img.src).filter(src => src && src.trim() !== "");
}

// Add blur effect to images
function applyBlurEffect(imgElement) {
    imgElement.style.filter = 'blur(10px)';
    imgElement.style.transition = 'filter 0.3s ease';
    imgElement.classList.add('hateful-meme');
    imgElement.dataset.processed = 'true';
}

// Process individual image elements
function processImageElement(img) {
    if (!processedImages.has(img.src)) {
        // Mock detection - replace with actual model later
        const isHateful = Math.random() > 0.5; // Random flagging for testing
        if (isHateful) {
            applyBlurEffect(img);
        }
        processedImages.add(img.src);
    }
}

// Batch of images to be sent
let imageBatch = new Set();

// Function to send batched images
const sendBatchedImages = debounce(() => {
    if (imageBatch.size > 0) {
        // Convert Set to Array and limit the batch size
        const imagesToSend = Array.from(imageBatch).slice(0, MAX_BATCH_SIZE);
        
        chrome.runtime.sendMessage({ 
            action: "newImages", 
            imageUrls: imagesToSend
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending images:', chrome.runtime.lastError);
            } else {
                console.log(`Successfully sent ${imagesToSend.length} images`);
            }
        });

        // Remove sent images from the batch
        imagesToSend.forEach(url => imageBatch.delete(url));
        
        // If there are still images in the batch, schedule another send
        if (imageBatch.size > 0) {
            console.log(`${imageBatch.size} images remaining in batch`);
            sendBatchedImages();
        }
    }
}, BATCH_TIMEOUT);

// Install the MutationObserver only once
if (!window.observerInitialized) {
    window.observerInitialized = true;
    
    const observer = new MutationObserver(mutations => {
        const newImageElements = [];
        
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if node itself is an image
                        if (node.tagName === 'IMG' && node.src) {
                            newImageElements.push(node);
                        }
                        // Check for nested images
                        const images = node.querySelectorAll('img:not([data-processed])');
                        newImageElements.push(...images);
                    }
                });
            }
        });

        // Process new images
        newImageElements.forEach(processImageElement);
        
        // Collect URLs for background script
        const newUrls = newImageElements
            .map(img => img.src)
            .filter(src => src && src.trim() !== "");
        
        if (newUrls.length > 0) {
            newUrls.forEach(url => imageBatch.add(url));
            // If batch size exceeds limit, trigger send immediately
            if (imageBatch.size >= MAX_BATCH_SIZE) {
                sendBatchedImages();
            } else {
                // Otherwise, use debounced send
                sendBatchedImages();
            }
        }
    });
    
    // Process existing images on initial load
    document.querySelectorAll('img').forEach(processImageElement);
    
    // Start observing changes in the entire document body
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
    });
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getImages") {
        const imageUrls = extractImageUrls();
        sendResponse({ imageUrls });
    } else if (message.action === "toggleBlur") {
        document.querySelectorAll('.hateful-meme').forEach(img => {
            img.style.filter = img.style.filter ? '' : 'blur(10px)';
        });
    }
    return true;
});
  