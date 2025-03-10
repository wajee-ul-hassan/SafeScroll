(function () {
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
    // Function to check if an image is inappropriate using the Flask API
    async function checkImageInappropriate(imageUrl) {
        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image_url: imageUrl })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data); // Debug log
            return {
                isInappropriate: data.is_inappropriate,
                confidence: data.confidence
            };
        } catch (error) {
            console.error('Error checking image:', error);
            return { isInappropriate: false, confidence: 0 };
        }
    }

    // Function to process an image element
    async function processImageElement(img) {
        // Skip if already processed or invalid URL
        if (!img.src || !img.src.startsWith('http') || processedImages.has(img.src)) {
            return null;
        }

        // Wait for image to load to get dimensions
        if (!img.complete) {
            try {
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
            } catch (error) {
                console.error('Error loading image:', error);
                return null;
            }
        }

        // Check image dimensions
        if (img.naturalWidth < 200 || img.naturalHeight < 200) {
            console.log(`Skipping small image: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`);
            processedImages.add(img.src); // Mark as processed to avoid rechecking
            return null;
        }

        try {
            const result = await checkImageInappropriate(img.src);
            console.log("Processing image:", img.src, "Result:", result); // Debug log

            // Mark image as processed
            processedImages.add(img.src);

            if (result.isInappropriate && result.confidence > 0.7) {
                applyBlurEffect(img);
                return {
                    url: img.src,
                    isInappropriate: true,
                    confidence: result.confidence,
                };
            }

            return {
                url: img.src,
                isInappropriate: false,
                confidence: result.confidence,
            };
        } catch (error) {
            console.error('Error processing image:', error);
            return null;
        }
    }

    // Function to process and collect image URLs
    async function processAndCollectImages() {
        const images = Array.from(document.querySelectorAll("img"));
        const processedResults = await Promise.all(
            images.map(img => processImageElement(img))
        );
        return processedResults.filter(result => result !== null);
    }

    // Batch of images to be sent
    let imageBatch = new Set();

    // Function to send batched images
    const sendBatchedImages = debounce(() => {
        if (imageBatch.size > 0) {
            const imagesToSend = Array.from(imageBatch);
            console.log("Sending batch to background:", imagesToSend); // Debug log

            chrome.runtime.sendMessage({
                action: "newImages",
                images: imagesToSend,
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
    async function handleMutations(mutations) {
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

        // Process new images and collect results
        const processPromises = newImageElements.map(img => processImageElement(img));
        const results = await Promise.all(processPromises);
        const validResults = results.filter(result => result !== null);

        console.log("New processed images:", validResults); // Debug log

        if (validResults.length > 0 && isSubscribed) {
            validResults.forEach(result => imageBatch.add(result));
            sendBatchedImages();
        }
    }

    // Function to initialize the observer
    async function initializeObserver() {
        if (!window.observerInitialized) {
            window.observerInitialized = true;
            console.log("Initializing observer");
            console.log("isSubscribed:", isSubscribed);

            // Process initial images
            const initialImages = await processAndCollectImages();
            console.log("Initial images processed:", initialImages);

            if (initialImages.length > 0 && isSubscribed) {
                initialImages.forEach(image => imageBatch.add(image));
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