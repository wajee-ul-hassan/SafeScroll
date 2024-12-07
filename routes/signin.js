const express = require('express');
const router = express.Router();
const path = require('path'); // Import the path module
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Adjust the path as necessary

router.post("/", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                error_message: "Invalid Username or Password."
            });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error_message: "Invalid Username or Password."
            });
        }
        const isVerified = user.isVerified;
        if (!isVerified) {
            return res.status(401).json({
                error_message: "User not Verified."
            });
        }

        // Generate a JWT
        const token = jwt.sign({ username: user.username, email: user.email }, 'Nevergiveup', { expiresIn: '10m' });

        // Send the JWT in an HTTP-only cookie
        res.cookie('authToken', token, { httpOnly: true, secure: true});
        res.status(200).send('Sign-in successful');

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

router.get('/', (req, res) => {
    res.render('signin');
});

module.exports = router;
