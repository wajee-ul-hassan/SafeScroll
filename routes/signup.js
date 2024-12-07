const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/user');


router.get('/', (req, res) => {
    res.render('signup');
});

router.post("/", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                error_message: "Username already exists."
            });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                error_message: "Email already exists."
            });
        }
        const jwt = require('jsonwebtoken');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit number
        const otpExpiry = Date.now() + 70000; // 70 seconds
        // Create a temporary token containing user data and OTP
        const tempUserData = { username, email, password: hashedPassword, otp, otpExpiry };
        const tempToken = jwt.sign(tempUserData, 'Nevergiveup', { expiresIn: '70s' });
        // Send verification email
        // const transporter = nodemailer.createTransport({
        //     service: 'Gmail',
        //     auth: {
        //         user: 'f219298@cfd.nu.edu.pk',
        //         pass: 'lucky031671660371#'
        //     },
        //     tls: { rejectUnauthorized: false }
        // });

        // const mailOptions = {
        //     from: 'f219298@cfd.nu.edu.pk',
        //     to: email,
        //     subject: 'Your OTP for Email Verification',
        //     html: `
        //     <p>Your OTP for email verification is: <strong>${otp}</strong>.</p>
        //     <p>The OTP is valid for 1 minute.</p>
        // `,
        // };

        // try {
        //     await transporter.sendMail(mailOptions);
        // } catch (error) {
        //     console.error("Error while sending email:", error);
        // }  
        // Render the email page after sending the OTP email
        res.status(200).json({
            message: 'Please check your email for verification.',
            email: email,
            temptoken: tempToken,
        });
    } catch (error) {
        errorTitle = "Error 500";
        errorMessage = "Internal Server Error."
        statusCode = 500;
        res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
});

module.exports = router;
