function validateForm(formObject) {
    // Check if any field is empty
    for (const [key, value] of Object.entries(formObject)) {
        if (!value) {
            showDangerAlert(`${key} cannot be empty`);
            return false;
        }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formObject.email)) {
        showDangerAlert('Invalid email format');
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
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };
    if (!validateForm(formObject)) {
        return;
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
        window.location.href = '/signin-success';
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