function validateForm(formObject) {
    // Check if any field is empty
    for (const [key, value] of Object.entries(formObject)) {
        if (!value) {
            showDangerAlert(`${key} cannot be empty`);
            return false;
        }
    }

    // Check username length and character requirements
    const usernamePattern = /^[A-Za-z]{4,}$/;
    if (!usernamePattern.test(formObject.username)) {
        showDangerAlert('Username must be at least 4 characters long and contain only alphabets');
        return false;
    }

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formObject.email)) {
        showDangerAlert('Invalid email format');
        return false;
    }

    // Check password strength
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!passwordPattern.test(formObject.password)) {
        showDangerAlert('Password must be at least 8 characters long, include at least one letter, one number, and one special character.');
        return false;
    }

    return true;
}


async function submitForm(event) {
    event.preventDefault();
    const formObject = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value
    };

    if (!validateForm(formObject)) {
        return; // Stop submission if validation fails
    }
    try {
        showLoadingBar();
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });
        if (!response.ok) {
            const errorData = await response.json(); // Parse the JSON response
            showDangerAlert(`${errorData.error_message}`);
            return;
        }
        const data = await response.json();
        // Redirect to the email page and pass the email in the URL
        window.location.href = `/email-page?username=${encodeURIComponent(data.username)}&email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}&temptoken=${encodeURIComponent(data.temptoken)}`;
    } catch (error) {
        showDangerAlert('An error occurred while signing up');
    } finally {
        hideLoadingBar();
    }

}

// Show loading bar
function showLoadingBar() {
    document.getElementById('loading-bar-container').style.display = 'block';
}

// Hide loading bar
function hideLoadingBar() {
    document.getElementById('loading-bar-container').style.display = 'none';
}

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