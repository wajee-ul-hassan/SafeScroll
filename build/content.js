(function() {
// Add this at the beginning of content.js
console.log('Content script loaded');

// Track processed images
const processedImages = new Set();
let isSubscribed = false;
let username = '';
let observer = null; // Store observer reference

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
        const isHateful = Math.random()>0.5; // Random flagging for testing
        if (isHateful) {
            applyBlurEffect(img);
        }
        processedImages.add(img.src);
        return img.src;
    }
    return null;
}

// Function to process and collect image URLs
function processAndCollectImages() {
    const images = Array.from(document.querySelectorAll("img"));
    const newUrls = [];
    
    images.forEach(img => {
        const url = processImageElement(img);
        if (url) {
            newUrls.push(url);
        }
    });
    
    return newUrls;
}

// Batch of images to be sent
let imageBatch = new Set();

// Function to send batched images
const sendBatchedImages = debounce(() => {
    if (imageBatch.size > 0) {
        const imagesToSend = Array.from(imageBatch);
        console.log("Sending images:", imagesToSend);
        chrome.runtime.sendMessage({ 
            action: "newImages", 
            imageUrls: imagesToSend,
            username: username
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending images:', chrome.runtime.lastError);
            } else {
                console.log(`Successfully sent ${imagesToSend.length} images`);
            }
        });

        imageBatch.clear();
    }
}, 3000); // Wait 3 seconds before sending

// Function to handle mutations
function handleMutations(mutations) {
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

    // Process new images and collect URLs
    const newUrls = newImageElements
        .map(img => processImageElement(img))
        .filter(url => url !== null);
    
    console.log("New images detected:", newUrls);
    if (newUrls.length > 0 && isSubscribed) {
        newUrls.forEach(url => imageBatch.add(url));
        sendBatchedImages();
    }
}

// Function to initialize the observer
function initializeObserver() {
    if (!window.observerInitialized) {
        window.observerInitialized = true;
        console.log("Initializing observer");
        console.log("isSubscribed:", isSubscribed);
        // Process initial images
        const initialUrls = processAndCollectImages();
        console.log("Initial images found:", initialUrls);
        if (initialUrls.length > 0 && isSubscribed) {
            initialUrls.forEach(url => imageBatch.add(url));
            sendBatchedImages();
        }
        
        // Create and configure the observer
        observer = new MutationObserver(handleMutations);
        
        // Start observing changes in the entire document body
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });
        
        console.log("Observer started successfully");
    }
}

// Flag to track if we've received the start message
let startMessageReceived = false;

// Function to handle initialization when both conditions are met
function handleInitialization() {
    if (startMessageReceived && document.readyState !== 'loading') {
        console.log("Starting initialization");
        initializeObserver();
    }
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startImageGrabbing") {
        console.log("Received startImageGrabbing message");
        startMessageReceived = true;
        isSubscribed = message.isSubscribed;
        username = message.username;
        handleInitialization();
        sendResponse("Image grabbing started");
    } else if (message.action === "stopImageCollection") {
        if (observer) {
            observer.disconnect();
            observer = null;
            window.observerInitialized = false;
            console.log("Observer stopped");
        }
    }
});

// Listen for DOM ready state changes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleInitialization);
} else {
    handleInitialization();
}
})();