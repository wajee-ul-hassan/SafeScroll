const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/user');
const authenticateToken = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.get('/', authenticateToken, (req, res) => {
    const user = req.user;

    if (user == null) {
        const errorTitle = "Authentication Required";
        const errorMessage = "Please sign in to access your profile settings.";
        const statusCode = 401;
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
            const errorTitle = "Session Expired";
            const errorMessage = "Your session has expired. Please sign in again to continue.";
            const statusCode = 401;
            return res.status(statusCode).render('error', {
                error_title: errorTitle,
                status_code: statusCode,
                error: errorMessage
            });
        }
        const user = await User.findOne({ username: tempuser.username });
        if (!user) {
            return res.status(404).json({ error: 'Unable to find your profile. Please try signing in again.' });
        }
        res.status(200).json({
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        const errorTitle = "Profile Access Error";
        const errorMessage = "We encountered an issue while accessing your profile. Please try again later.";
        const statusCode = 500;
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
        return res.status(400).json({ error: 'Please enter a valid username.' });
    }

    // Validate username format
    const usernamePattern = /^[A-Za-z]{4,}$/;
    if (!usernamePattern.test(username)) {
        return res.status(400).json({ 
            error: 'Username must be at least 4 characters long and contain only letters.' 
        });
    }

    try {
        const user = req.user;
        if (!user) {
            const errorTitle = "Session Expired";
            const errorMessage = "Your session has expired. Please sign in again to update your profile.";
            const statusCode = 401;
            return res.status(statusCode).render('error', {
                error_title: errorTitle,
                status_code: statusCode,
                error: errorMessage
            });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'This username is already taken. Please choose a different one.' 
            });
        }
        const email = req.user.email;
        const updatedUser = await User.findOne({ email });
        if (!updatedUser) {
            return res.status(404).json({ 
                error: 'Unable to find your account. Please try signing in again.' 
            });
        }
        updatedUser.username = username;
        await updatedUser.save();
        res.cookie('authToken', '', { httpOnly: true, secure: true, expires: new Date(0) });
        // Generate a JWT using a secure key from environment variables
        const token = jwt.sign({ username: updatedUser.username, email: updatedUser.email }, 'Nevergiveup', { expiresIn: '10m' });

        // Send the JWT in an HTTP-only cookie
        res.cookie('authToken', token, { httpOnly: true, secure: true });
        res.status(200).json({
            message: 'Your username has been successfully updated.',
            username: updatedUser.username,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        const errorTitle = "Update Failed";
        const errorMessage = "We couldn't update your profile at this time. Please try again later.";
        const statusCode = 500;
        res.status(statusCode).render('error', {
            error_title: errorTitle,
            status_code: statusCode,
            error: errorMessage
        });
    }
});

// Add password update route
router.post('/updatepassword', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            error: 'Please provide both your current password and new password.' 
        });
    }

    // Validate password format
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()]/.test(newPassword);

    if (newPassword.length < minLength || !hasUpperCase || !hasSpecialChar) {
        return res.status(400).json({ 
            error: 'Password must be at least 8 characters long and include an uppercase letter and a special character.' 
        });
    }

    try {
        // Get user from database
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ 
                error: 'Unable to find your account. Please try signing in again.' 
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'The current password you entered is incorrect. Please try again.' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Generate new JWT token
        const token = jwt.sign(
            { username: user.username, email: user.email },
            'Nevergiveup',
            { expiresIn: '10m' }
        );

        // Clear old token and set new one
        res.cookie('authToken', '', { httpOnly: true, secure: true, expires: new Date(0) });
        res.cookie('authToken', token, { httpOnly: true, secure: true });

        res.status(200).json({ message: 'Your password has been successfully updated.' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ 
            error: 'We encountered an issue while updating your password. Please try again later.' 
        });
    }
});

module.exports = router;