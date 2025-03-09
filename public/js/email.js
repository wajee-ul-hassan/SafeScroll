document.getElementById("otpForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const otp = document.getElementById("otpInput").value;
    const temptoken = document.getElementById("otptoken").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const response = await fetch("/email-page/verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ otp, temptoken, username, email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle error message
            showDangerAlert(result.error_message || "Unexpected error occurred.");
            return;
        }

        // Clear browser history before redirecting
        window.history.replaceState(null, '', '/signin?closed=true');
        
        // Prevent going back
        history.pushState(null, '', '/signin?closed=true');
        window.onpopstate = function(event) {
            history.go(1);
        };

        // Redirect to signin
        window.location.href = '/signin?closed=true';
    } catch (error) {
        console.error("Client-side error during OTP verification:", error);
        showDangerAlert("An error occurred while verifying the OTP. Please try again later.");
    }
});

document.getElementById("resendOtpLink").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    showLoadingBar();
    try {
        const response = await fetch("/email-page/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, username, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            showDangerAlert(result.error_message || "Unexpected error occurred.");
            return;
        }
        window.location.href = `/email-page?username=${encodeURIComponent(result.username)}&email=${encodeURIComponent(result.email)}&password=${encodeURIComponent(result.password)}&temptoken=${encodeURIComponent(result.temptoken)}`;
    } catch (error) {
        showDangerAlert("An error occurred while resending the OTP. Please try again.");
    } finally {
        hideLoadingBar();
    }
});

function moveToNext(input, nextId) {
    if (input.value.length === 1 && nextId) {
        document.getElementById(nextId).focus();
    }
}

function updateHiddenInput() {
    const otp1 = document.getElementById('otp1').value;
    const otp2 = document.getElementById('otp2').value;
    const otp3 = document.getElementById('otp3').value;
    const otp4 = document.getElementById('otp4').value;

    // Combine the values and set it to the hidden input field
    const otpValue = otp1 + otp2 + otp3 + otp4;
    document.getElementById('otpInput').value = otpValue;
}
document.addEventListener("DOMContentLoaded", function () {
    const timerElement = document.getElementById("timer");
    let timeLeft = 60; // Time in seconds

    const timerInterval = setInterval(() => {
        // Calculate minutes and seconds
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        // Format the time (e.g., 0:09)
        timerElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        timeLeft--;

        // Stop the timer when it reaches 0
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "0:00";
        }
    }, 1000);

    const otpInputs = document.querySelectorAll('.otp-input');

// Attach event listeners to each input field
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (event) => {
        // Move to the next input if the current one is full
        if (input.value.length >= 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (event) => {
        // Move to the previous input if Backspace is pressed and the current input is empty
        if (event.key === 'Backspace' && input.value === '' && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
});
});

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
