const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


// Endpoint to render the email page
router.get('/', (req, res) => {
    const email = req.query.email ? decodeURIComponent(req.query.email) : undefined;
    const temptoken = req.query.temptoken ? decodeURIComponent(req.query.temptoken) : undefined;
    // Check if the necessary query parameters are present
    if (!email || !temptoken) {
        return res.status(404).render('error', {
            error_title: "Error 404",
            status_code: 404,
            error: "Page cannot be found",
        });
    }
    else {
        res.render('emailpage', { userEmail: email, temptoken: temptoken });
    }
});

router.post("/verify-otp", async (req, res) => {
    const { otp, temptoken } = req.body;
    // Check if required parameters are present
    if (!otp || !temptoken) {
        return res.status(404).json({
            error_message: "Page cannot be found",
        });
    }
    try {
        const tempUserData = jwt.verify(temptoken, 'Nevergiveup');
        // Check if OTP matches and is not expired
        const trimmedOtp = otp.trim();
        if (Number(tempUserData.otp) !== Number(trimmedOtp) || Date.now() > tempUserData.otpExpiry) {
            return res.status(400).json({
                error_message: "Invalid or expired OTP.",
            });
        }

        // Save the user to the database
        const newUser = new User({
            username: tempUserData.username,
            email: tempUserData.email,
            password: tempUserData.password,
            isVerified: true,
        });

        await newUser.save();

        // Send success response
        return res.status(200).json({
            message: "OTP Verified",
        });
    } catch (error) {
        console.error("Error during OTP verification:", error);

        // Send proper error response
        return res.status(500).json({
            error_message: "An error occurred while verifying the OTP. Please try again later.",
        });
    }
});


router.post("/resend-otp", async (req, res) => {
    try {
        const userEmail = req.body.email;
        const temptoken = req.body.temptoken;
        if (!userEmail || !temptoken) {
            return res.status(404).render('error', {
                error_title: "Error 404",
                status_code: 404,
                error: "Page cannot be found",
            });
        }

        // Verify the temp token
        const tempUserData = jwt.verify(temptoken, 'Nevergiveup');

        // Generate a new OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        const otpExpiry = Date.now() + 70000; // 70 seconds

        tempUserData.otp = otp;
        tempUserData.otpExpiry = otpExpiry;

        // Remove any existing `exp` property to avoid conflicts
        if (tempUserData.exp) {
            delete tempUserData.exp;
        }

        // Sign a new token
        let newTempToken;
        try {
            newTempToken = jwt.sign(tempUserData, 'Nevergiveup', { expiresIn: '70s' });
        } catch (error) {
            console.error("Error generating new token:", error);
            return res.status(500).json({
                error_message: "Failed to generate a new token.",
            });
        }

        // Send the new OTP via email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'f219298@cfd.nu.edu.pk', // Use an app password
                pass: 'lucky031671660371#'     // Replace with a Gmail app password
            },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: 'f219298@cfd.nu.edu.pk',
            to: userEmail,
            subject: 'Your New OTP for Email Verification',
            html: `
                <p>Your new OTP for email verification is: <strong>${otp}</strong>.</p>
                <p>The OTP is valid for 1 minute.</p>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error while sending email:", error);
            return res.status(500).json({
                error_message: "Failed to send the email. Please try again later.",
            });
        }
        // Send a successful response
        return res.status(200).json({
            message: "OTP Resent",
            email: userEmail,
            temptoken: newTempToken,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error_message: "An error occurred while resending the OTP. Please try again later.",
        });
    }
});

module.exports = router;
