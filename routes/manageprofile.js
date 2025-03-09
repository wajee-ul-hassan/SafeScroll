const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/user');
const authenticateToken = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
router.get('/', authenticateToken, (req, res) => {
    const user = req.user;

    if (user == null) {
        const errorTitle = "Error 404";
        const errorMessage = "Page not Found.";
        const statusCode = 404;
        return res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
    res.render('manageprofile');
});
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const tempuser = req.user;
        if (!tempuser) {
            const errorTitle = "Error 404";
            const errorMessage = "Page not Found.";
            const statusCode = 404;
            return res.status(statusCode).render('error', {
                error_title: errorTitle,
                status_code: statusCode,
                error: errorMessage
            });
        }
        const user = await User.findOne({ username: tempuser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.status(200).json({
            username: user.username,
            email: user.email,
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

router.post('/update', authenticateToken, async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim() === '') {
        return res.status(400).json({ error: 'Username cannot be empty.' });
    }
    try {
        const user = req.user;
        if (!user) {
            const errorTitle = "Error 404";
            const errorMessage = "Page not Found.";
            const statusCode = 404;
            return res.status(statusCode).render('error', {
                error_title: errorTitle,
                status_code: statusCode,
                error: errorMessage
            });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }
        const email = req.user.email;
        const updatedUser = await User.findOne({ email });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }
        updatedUser.username = username;
        await updatedUser.save();
        res.cookie('authToken', '', { httpOnly: true, secure: true, expires: new Date(0) });
        // Generate a JWT using a secure key from environment variables
        const token = jwt.sign({ username: updatedUser.username, email: updatedUser.email }, 'Nevergiveup', { expiresIn: '10m' });

        // Send the JWT in an HTTP-only cookie
        res.cookie('authToken', token, { httpOnly: true, secure: true });
        res.status(200).json({
            message: 'Username updated successfully.',
            username: updatedUser.username,
        });
    } catch (error) {
        errorTitle = "Temporary Service Disruption";
        errorMessage = "We're experiencing some technical difficulties at the moment. Our team has been notified and is working to resolve this issue. We apologize for any inconvenience."
        statusCode = 500;
        res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
});

module.exports = router;