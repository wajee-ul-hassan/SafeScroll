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
    const token = req.cookies.token;
    // Validate input fields
    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }

    try {
        // Check if the username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).send('Username already exists.');
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).send('Email already exists.');
        }
        const jwt = require('jsonwebtoken');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!token) {
            const token = jwt.sign({ email }, 'Nevergiveup', { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
        }
        // Generate a 4-digit OTP
        // const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit number
        // const otpExpiry = Date.now() + 600000; // 10 minutes expiry

        // // Create and save the new user with OTP and verification fields
        // const newUser = new User({
        //     username,
        //     email,
        //     password: hashedPassword,
        //     otp,
        //     otpExpiry,
        //     isVerified: false,
        // });

        // await newUser.save();

        // // Send verification email
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
        //     <p>The OTP is valid for 10 minutes.</p>
        // `,
        // };

        // await transporter.sendMail(mailOptions);
        // Render the email page after sending the OTP email
        console.log("OTP email sent successfully, rendering email page...");
        res.redirect(`/email-page?email=${encodeURIComponent(email)}`);
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
