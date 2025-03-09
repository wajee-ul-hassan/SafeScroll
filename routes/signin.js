const express = require('express');
const router = express.Router();
const path = require('path'); // Import the path module
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Adjust the path as necessary
const authenticateToken = require('../middlewares/auth');

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = req.user;

        if (user !== null) {
            return res.status(404).render('error', {
                error_title: "Already Signed In",
                status_code: 404,
                error: "You are already signed in. Please sign out first if you want to access the sign-in page."
            });
        }

        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.status(401).json({
                error_message: "The email or password you entered is incorrect. Please try again."
            });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error_message: "The email or password you entered is incorrect. Please try again."
            });
        }

        const isVerified = foundUser.isVerified;
        if (!isVerified) {
            return res.status(401).json({
                error_message: "Please verify your email address before signing in."
            });
        }

        // Generate a JWT using a secure key from environment variables
        const token = jwt.sign({ username: foundUser.username, email: foundUser.email }, 'Nevergiveup', { expiresIn: '10m' });

        // Send the JWT in an HTTP-only cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600000 // 10 minutes
        });
        res.status(200).send('Sign-in successful');

    } catch (error) {
        console.error('Error during sign-in:', error);
        return res.status(500).render('error', {
            error_title: "Sign-in Error",
            status_code: 500,
            error: "We're having trouble processing your sign-in request. Please try again in a few moments."
        });
    }
});

router.get('/', authenticateToken, (req, res) => {
    const user = req.user;

    if (user !== null) {
        return res.status(404).render('error', {
            error_title: "Already Signed In",
            status_code: 404,
            error: "You are already signed in. Please sign out first if you want to access the sign-in page."
        });
    }
    res.render('signin');
});

module.exports = router;
