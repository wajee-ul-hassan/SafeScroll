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
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    if (!passwordPattern.test(formObject.password)) {
        showDangerAlert('Password must be at least 5 characters long, contain at least one letter and one number');
        return false;
    }
    console.log(formObject.password);
    console.log(formObject.confirmpassword);
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
        const response = await fetch('/forgetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Parse the JSON response
            showDangerAlert(`${errorData.error_message}`);
            return;
        }
        showSuccessAlert("Password reset successful.");
        window.location.href = "/signin";
    } catch (error) {
        showDangerAlert('An Error Occurred while resetting.');
    }
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