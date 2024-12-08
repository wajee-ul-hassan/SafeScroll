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
        showDangerAlert('Invalid Credentials');
        return false;
    }


    // Check password strength
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!passwordPattern.test(formObject.password)) {
        showDangerAlert('Invalid Credentials');
        return false;
    }
    return true;
}


async function signinFORM(event) {
    event.preventDefault();

    const formObject = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };
    if (!validateForm(formObject)) {
        return; // Stop submission if validation fails
    }

    try {
        const response = await fetch('/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json(); // Parse the JSON response
            showDangerAlert(`${errorData.error_message}`);
            return;
        }
        window.location.href = '/subscribe';
    } catch (error) {
        showDangerAlert('An Error Occurred while Signing in');
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