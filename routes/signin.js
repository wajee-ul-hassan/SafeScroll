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
            errorTitle = "Error 401";
            errorMessage = "Invalid Username and Password."
            statusCode = 401;
            return res.status(statusCode).render('error', {
                error_title: errorTitle,
                status_code: statusCode,
                error: errorMessage
            });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            errorTitle = "Error 401";
            errorMessage = "Invalid Username and Password."
            statusCode = 401;
            return res.status(statusCode).render('error', {
                error_title: errorTitle,
                status_code: statusCode,
                error: errorMessage
            });
        }

        // Generate a JWT
        const token = jwt.sign({ username: user.username, email: user.email }, 'Nevergiveup', { expiresIn: '1h' });

        // Send the JWT in an HTTP-only cookie
        res.cookie('authToken', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
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
