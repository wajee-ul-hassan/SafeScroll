const express = require('express');
const router = express.Router();
const User = require('../models/user');
const isAuthorized = require('../middlewares/verify-signup');
const nodemailer = require('nodemailer');


// Endpoint to render the email page
router.get('/', isAuthorized, (req, res) => {
    const email = req.query.email; // Extract the email from the query string
    console.log(email);
    if (email) {
        res.render('emailpage', { userEmail: email });
    }
    else {
        errorTitle = "Error 400";
        errorMessage = "Trying to access page without authorization.";
        statusCode=400;
        res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
});

router.post("/verify-otp", isAuthorized, async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.findOne({ otp });

        if (!user) {
            return res.status(400).send(`
                <script>
                    alert("Invalid OTP! Please try again.");
                    window.history.back();
                </script>
            `);
        }

        // Check if the OTP has expired
        if (Date.now() > user.otpExpiry) {
            return res.status(400).send(`
                <script>
                    alert("OTP has expired! Please request a new OTP.");
                    window.history.back();
                </script>
            `);
        }

        // Mark the user as verified and clear OTP and OTP expiry
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Redirect to sign-in page
        res.redirect("/signin");
    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).send("An error occurred during OTP verification.");
    }
});

router.post("/resend-otp", isAuthorized, async (req, res) => {
    try {
        const userEmail = req.body.email;
        console.log(userEmail);
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(400).send(`
                <script>
                    alert("User not found. Please sign up again.");
                    window.history.back();
                </script>
            `);
        }

        // Generate a new OTP
        const newOtp = Math.floor(1000 + Math.random() * 9000);
        user.otp = newOtp;
        user.otpExpiry = Date.now() + 600000; // 10 minutes expiry
        await user.save();

        // Send the new OTP via email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'f219298@cfd.nu.edu.pk',
                pass: 'lucky031671660371#'
            },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: 'f219298@cfd.nu.edu.pk',
            to: userEmail,
            subject: 'Your New OTP for Email Verification',
            html: `
                <p>Your new OTP for email verification is: <strong>${newOtp}</strong>.</p>
                <p>The OTP is valid for 10 minutes.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send(`
            <script>
                alert("A new OTP has been sent to your email.");
                window.location.href = "/email-page";
            </script>
        `);
    } catch (error) {
        errorTitle = "Error 500";
        errorMessage = "An error occurred while resending the OTP."
        statusCode = 500;
        res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
});


module.exports = router;
