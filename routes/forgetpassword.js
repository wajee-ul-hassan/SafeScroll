const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user'); // Adjust the path as necessary
const authenticateToken = require('../middlewares/auth');
const nodemailer = require('nodemailer');

router.get('/', authenticateToken, (req, res) => {
    const user = req.user;
    
    if (user !== null) {
        const errorTitle = "Error 404";
        const errorMessage = "Page not Found.";
        const statusCode = 404;
        return res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
    res.render('forgetpassword');
});

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        console.log('Received request for username:', username);

        // Check if the user exists
        const user = await User.findOne({ username, email });
        if (!user) {
            return res.status(400).json({
                error_message: "User does not exist."
            });
        }

        const jwt = require('jsonwebtoken');
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit OTP
        const otpExpiry = Date.now() + 70000; // OTP expiration time (70 seconds)

        // Create a temporary token containing user data and OTP
        const tempUserData = { otp, otpExpiry };
        const tempToken = jwt.sign(tempUserData, 'Nevergiveup', { expiresIn: '70s' });
        // Send verification email
        console.log(tempToken);
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
            to: email,
            subject: 'Your OTP for Email Verification',
            html: `
                <p>Your OTP for email verification is: <strong>${otp}</strong>.</p>
                <p>The OTP is valid for 1 minute.</p>
            `,
        };

        // Send the email and handle errors
        await transporter.sendMail(mailOptions);

        // Respond only after successful email sending
        res.status(200).json({
            message: 'Please check your email for verification.',
            email: email,
            temptoken: tempToken,
            username: username,
            password: password,
        });
    } catch (error) {
        console.error("Error during OTP generation and email sending:", error);

        // Respond with an error page if an error occurs
        res.status(500).render('error', {
            error_title: "Error 500",
            status_code: 500,
            error: "Internal Server Error"
        });
    }
});


module.exports = router;
