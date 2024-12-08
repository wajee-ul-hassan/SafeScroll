document.addEventListener('DOMContentLoaded', async () => {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const editUsernameButton = document.getElementById('editUsername');
    const editUsernameSection = document.getElementById('editUsernameSection');
    const newUsernameInput = document.getElementById('newUsername');
    const saveUsernameButton = document.getElementById('saveUsername');
    // Fetch user data from server
    try {
        const response = await fetch('/manageprofile/profile', {
            credentials: 'include', // Include cookies for authentication
        });
        const data = await response.json();
        if (!response.ok) {
            showDangerAlert(`${data.error}`);
            throw new Error('Failed to fetch profile data.');
        }

        usernameInput.value = data.username;
        emailInput.value = data.email;
    } catch (error) {
        console.error('Error fetching profile:', error);
    }

    // Handle Edit Username Button
    editUsernameButton.addEventListener('click', () => {
        editUsernameSection.classList.toggle('d-none');
        newUsernameInput.value = usernameInput.value;
    });

    // Handle Save Username Button
    saveUsernameButton.addEventListener('click', async () => {
        const newUsername = newUsernameInput.value.trim();

        const usernamePattern = /^[A-Za-z]{4,}$/;
        if (!usernamePattern.test(newUsername)) {
            showDangerAlert('Username must be at least 4 characters long and contain only alphabets');
            return false;
        }
        if (!newUsername) {
            showDangerAlert('Username cannot be empty!');
            return;
        }
        try {
            const response = await fetch('/manageprofile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username: newUsername }),
            });
            const data = await response.json();
            if (!response.ok) {
                showDangerAlert(`${data.error}`);
                throw new Error('Failed to update username.');
            }

            usernameInput.value = data.username;
            showSuccessAlert(`${data.message}`);
            editUsernameSection.classList.add('d-none');
        } catch (error) {
            console.error('Error updating username:', error);
        }
    });
});

function showDangerAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    });
}

function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
    });
}
