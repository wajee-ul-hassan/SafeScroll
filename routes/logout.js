// routes/logout.js
const express = require('express');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).render('error', {
            error_title: "Session Expired",
            status_code: 404,
            error: "Your session appears to have expired or you're not currently logged in."
        });
    }
    res.cookie('authToken', '', { httpOnly: true, secure: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;


