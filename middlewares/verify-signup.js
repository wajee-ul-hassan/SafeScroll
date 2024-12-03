const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

function isAuthorized(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/signup');
    }

    try {
        jwt.verify(token, 'Nevergiveup');
        return next();
    } catch (error) {
        res.redirect('/signup');
    }
}

// Export the function directly
module.exports = isAuthorized;
