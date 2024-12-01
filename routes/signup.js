const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getTempUserStore } = require('./email'); // Import the function to get tempUserStore
const User = require('../models/user');

// Utilize the tempUserStore from email route
const tempUserStore = getTempUserStore();

router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Temporarily store user info
        tempUserStore[verificationToken] = {
            username,
            email,
            password: hashedPassword,
            verificationTokenExpiry: Date.now() + 3600000, // 1 hour expiry
        };

        // Send verification email
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
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: 
            http://${req.headers.host}/email-page/verify-email?token=${verificationToken}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Signup successful. Please check your email for verification.');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/', (req, res) => {
    res.render('signup');
});

module.exports = router;
