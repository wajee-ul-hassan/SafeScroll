// // Function to check user status
// async function checkUserStatus() {
//     try {
//         return new Promise((resolve) => {
//             chrome.runtime.sendMessage({ action: "getUserStatus" }, (response) => {
//                 if (chrome.runtime.lastError) {
//                     console.error('Error getting user status:', chrome.runtime.lastError);
//                     // resolve({ isLoggedIn: false, isSubscribed: false });
//                 } else {
//                     resolve(response);
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('Error checking user status:', error);
//         return { isLoggedIn: false, isSubscribed: false };
//     }
// }

// // Function to get stored images from chrome.storage
// async function getStoredImages() {
//     try {
//         const result = await chrome.storage.local.get('storedImages');
//         const storedImages = result.storedImages || [];
        
//         // Filter images from the last 24 hours
//         const now = Date.now();
//         const oneDayInMs = 24 * 60 * 60 * 1000;
        
//         return storedImages.filter(img => 
//             (now - img.timestamp) < oneDayInMs
//         );
//     } catch (error) {
//         console.error('Error getting stored images:', error);
//         return [];
//     }
// }

// // Function to show error message
// function showError(message) {
//     const container = document.querySelector('.container');
//     if (!container) return;

//     // Remove existing content
//     const existingContent = container.querySelector('.content');
//     if (existingContent) {
//         existingContent.remove();
//     }

//     // Create error message
//     const errorDiv = document.createElement('div');
//     errorDiv.className = 'error-message';
//     errorDiv.innerHTML = `
//         <h2 class="section-title">Error</h2>
//         <p style="color: #e74c3c; font-size: 1.2em;">${message}</p>
//         <p>Please make sure you are logged in and have an active subscription to view the dashboard.</p>
//     `;
//     container.appendChild(errorDiv);
// }

// // Function to create and inject the images table
// function createImagesTable(images) {
//     const container = document.querySelector('.container');
//     if (!container) return;

//     // Remove existing content
//     const existingContent = container.querySelector('.content');
//     if (existingContent) {
//         existingContent.remove();
//     }

//     // Create content wrapper
//     const contentDiv = document.createElement('div');
//     contentDiv.className = 'content';

//     // Create new table
//     const table = document.createElement('table');
//     table.className = 'image-table';
    
//     // Create table header
//     const thead = document.createElement('thead');
//     thead.innerHTML = `
//         <tr>
//             <th>Image URL</th>
//             <th>Status</th>
//             <th>Detected At</th>
//         </tr>
//     `;
//     table.appendChild(thead);

//     // Create table body
//     const tbody = document.createElement('tbody');
//     if (images.length === 0) {
//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//             <td colspan="3" style="text-align: center;">
//                 No recent images detected!
//             </td>
//         `;
//         tbody.appendChild(tr);
//     } else {
//         images.forEach(image => {
//             const tr = document.createElement('tr');
//             tr.innerHTML = `
//                 <td class="url-cell">
//                     <a href="${image.url}" target="_blank">
//                         ${image.url}
//                     </a>
//                 </td>
//                 <td class="status-cell ${image.isHateful ? 'status-hateful' : 'status-safe'}">
//                     ${image.isHateful ? 'Hateful' : 'Safe'}
//                 </td>
//                 <td>
//                     ${new Date(image.timestamp).toLocaleString()}
//                 </td>
//             `;
//             tbody.appendChild(tr);
//         });
//     }
//     table.appendChild(tbody);

//     contentDiv.appendChild(table);
//     container.appendChild(contentDiv);
// }

// // Function to initialize the dashboard
// async function initializeDashboard() {
//     const { isLoggedIn, isSubscribed } = await checkUserStatus();
    
//     if (!isLoggedIn) {
//         showError('You must be logged in to view the dashboard.');
//         return;
//     }

//     if (!isSubscribed) {
//         showError('You need an active subscription to view the dashboard.');
//         return;
//     }

//     const images = await getStoredImages();
//     createImagesTable(images);
// }

// // Initialize when the page loads
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeDashboard);
// } else {
//     initializeDashboard();
// } 