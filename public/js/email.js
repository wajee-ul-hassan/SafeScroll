document.getElementById("otpForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const otp = document.getElementById("otpInput").value;
    const temptoken = document.getElementById("otptoken").value;

    try {
        const response = await fetch("/email-page/verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ otp, temptoken }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle error message
            showDangerAlert(result.error_message || "Unexpected error occurred.");
            return;
        }

        // Success case
        showSuccessAlert("OTP Verified");
        window.location.href = '/signin';
    } catch (error) {
        console.error("Client-side error during OTP verification:", error);
        showDangerAlert("An error occurred while verifying the OTP. Please try again later.");
    }
});

document.getElementById("resendOtpForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("emailInputResend").value;
    const temptoken = document.getElementById("otptoken").value;
    showLoadingBar();
    try {
        const response = await fetch("/email-page/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, temptoken }),
        });

        const result = await response.json();

        if (!response.ok) {
            showDangerAlert(result.error_message || "Unexpected error occurred.");
            return;
        }
        showSuccessAlert("Successfully sent the OTP.");
        window.location.href = `/email-page?email=${encodeURIComponent(result.email)}&temptoken=${encodeURIComponent(result.temptoken)}`;
    } catch (error) {
        showDangerAlert("An error occurred while resending the OTP. Please try again.");
    } finally {
        hideLoadingBar();
    }
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
