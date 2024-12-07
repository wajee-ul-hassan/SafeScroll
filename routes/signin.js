const express = require('express');
const router = express.Router();
const path = require('path'); // Import the path module
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Adjust the path as necessary
const authenticateToken = require('../middlewares/auth');

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = req.user;  // This comes from the authenticateToken middleware

        if (user !== null) {
            return res.status(401).json({
                error_message: "Already Signed in."
            });
        }

        const foundUser = await User.findOne({ username });

        if (!foundUser) {
            return res.status(401).json({
                error_message: "Invalid Username or Password."
            });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error_message: "Invalid Username or Password."
            });
        }

        const isVerified = foundUser.isVerified;
        if (!isVerified) {
            return res.status(401).json({
                error_message: "User not Verified."
            });
        }

        // Generate a JWT using a secure key from environment variables
        const token = jwt.sign({ username: foundUser.username, email: foundUser.email },'Nevergiveup', { expiresIn: '10m' });

        // Send the JWT in an HTTP-only cookie
        res.cookie('authToken', token, { httpOnly: true, secure: true });
        res.status(200).send('Sign-in successful');

    } catch (error) {
        console.error('Error during sign-in:', error);
        const errorTitle = "Error 500";
        const errorMessage = "Internal Server Error.";
        const statusCode = 500;
        res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
});


router.get('/', (req, res) => {
    res.render('signin');
});

module.exports = router;
