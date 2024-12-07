const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user'); // Adjust the path as necessary


router.get('/', (req, res) => {
    res.render('forgetpassword');
});

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ username, email });
        if (!user) {
            return res.status(400).json({
                error_message: "User does not exist."
            });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        // Redirect to sign in page with success message
        res.status(200).send('Password reset successful.');
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
