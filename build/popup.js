// document.addEventListener('DOMContentLoaded', () => {
//     const buySubscriptionButton = document.getElementById('buySubscription');
//     const signin = document.getElementById('signin');

//     if (buySubscriptionButton) {
//         buySubscriptionButton.addEventListener('click', () => {
//             chrome.runtime.sendMessage({ action: 'openSubsPage' }, (response) => {
//             });
//         });
//     }

//     if (signin) {
//         signin.addEventListener('click', () => {
//             chrome.runtime.sendMessage({ action: 'opensigninPage' }, (response) => {
//             });
//         });
//     }
// });

document.addEventListener('DOMContentLoaded', async () => {
    const navbar = document.getElementById('navbar');
    const noteSection = document.querySelector('.note');
    const buySubscriptionButton = document.getElementById('buySubscription');

    if (buySubscriptionButton) {
        buySubscriptionButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openSubsPage' }, (response) => { });
        });
    }

    const attachNavbarEventListeners = () => {
        const signin = document.getElementById('signin');
        const dashboard = document.getElementById('dashboard');
        const logout = document.getElementById('logout');

        if (signin) {
            signin.addEventListener('click', () => {
                chrome.runtime.sendMessage({ action: 'opensigninPage' }, (response) => { });
            });
        }

        if (dashboard) {
            dashboard.addEventListener('click', () => {
                chrome.runtime.sendMessage({ action: 'openDashboard' }, (response) => { });
            });
        }
        if (logout) {
            logout.addEventListener('click', function () {
                const userConfirmed = confirm("Are you sure you want to logout?");
                if (userConfirmed) {
                    chrome.runtime.sendMessage({ action: 'logout' }, (response) => { });
                }
            });
        }

    };

    try {
        // Fetch data from the server endpoint
        const response = await fetch('http://localhost:3000/popup', {
            credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
            throw new Error('Failed to fetch popup content.');
        }

        const data = await response.json(); // Expect JSON data from the endpoint
        const { isLoggedIn, isSubscribed, username } = data;
        // Update the navbar
        if (navbar) {
            let navbarHTML = `
                <span class="logo">
                    <img src="./safescroll.png" alt="SafeScroll Logo"> Safescroll
                </span>
                <div>
            `;

            if (!isLoggedIn) {
                navbarHTML += `<button class="btn" id="signin">Signin</button>`;
            } else {
                navbarHTML += `
                <div class="dropdown">
                <span class="" id="dropdownMenuButton1" data-bs-toggle="dropdown"
                    aria-expanded="false" style="cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                        class="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                        <path fill-rule="evenodd"
                            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                    </svg>
                </span>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" id="logout">Logout</a></li>
                </ul>
            </div>
                `;

                if (isSubscribed) {
                    navbarHTML += `<button class="btn" id="dashboard">Dashboard</button>`;
                }
            }

            navbarHTML += `</div>`;
            navbar.innerHTML = navbarHTML;

            // Reattach event listeners to the newly created elements
            attachNavbarEventListeners();
        }

        // Update subscription-related content
        if (noteSection) {
            noteSection.style.display = isSubscribed ? 'none' : 'block';
        }
        buySubscriptionButton.style.display = isSubscribed ? 'none' : 'block';
    } catch (err) {
        console.error('Error:', err);

        // Display fallback content on error
        if (navbar) {
            navbar.innerHTML = `<p>Error loading content.</p>`;
        }
        if (noteSection) {
            noteSection.style.display = 'none';
        }
    }
});



