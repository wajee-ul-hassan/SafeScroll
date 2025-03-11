document.addEventListener('DOMContentLoaded', async () => {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const editUsernameButton = document.getElementById('editUsername');
    const editPasswordButton = document.getElementById('editPassword');
    const editUsernameSection = document.getElementById('editUsernameSection');
    const editPasswordSection = document.getElementById('editPasswordSection');
    const newUsernameInput = document.getElementById('newUsername');
    const saveUsernameButton = document.getElementById('saveUsername');
    const savePasswordButton = document.getElementById('savePassword');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Password visibility toggle
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = button.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Fetch user data from server
    try {
        const response = await fetch('/manageprofile/profile', {
            credentials: 'include',
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
        editPasswordSection.classList.add('d-none');
        newUsernameInput.value = usernameInput.value;
    });

    // Handle Edit Password Button
    editPasswordButton.addEventListener('click', () => {
        editPasswordSection.classList.toggle('d-none');
        editUsernameSection.classList.add('d-none');
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });

    // Password validation function
    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()]/.test(password);

        return password.length >= minLength && 
               hasUpperCase && 
               hasSpecialChar;
    }

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

    // Handle Save Password Button
    savePasswordButton.addEventListener('click', async () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showDangerAlert('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            showDangerAlert('New passwords do not match');
            return;
        }

        if (!validatePassword(newPassword)) {
            showDangerAlert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
            return;
        }

        try {
            const response = await fetch('/manageprofile/updatepassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                showDangerAlert(`${data.error}`);
                throw new Error('Failed to update password.');
            }

            showSuccessAlert('Password updated successfully');
            editPasswordSection.classList.add('d-none');
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (error) {
            console.error('Error updating password:', error);
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
