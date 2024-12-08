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
    // Check if passwords match
    if (formObject.password != formObject.confirmpassword) {
        showDangerAlert('Passwords do not match');
        return false;
    }
    return true;
}




async function forgetpassword(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmpassword = document.getElementById('confirmpassword').value;

    const data = { username, email, password, confirmpassword };

    if (!validateForm(data)) {
        return;
    }

    try {
        showLoadingBar();
        const response = await fetch('/forgetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            showDangerAlert(`${result.error_message}`);
            return;
        }
        window.location.href = `/email-page?username=${encodeURIComponent(result.username)}&email=${encodeURIComponent(result.email)}&password=${encodeURIComponent(result.password)}&temptoken=${encodeURIComponent(result.temptoken)}`;
    } catch (error) {
        showDangerAlert('An Error Occurred while resetting.');
    } finally {
        hideLoadingBar();
    }
}
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