const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const User = require('../models/user');
const ejs = require('ejs');
const path = require('path');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const tempuser = req.user || null;
        let user = null;
        let isLoggedIn = false;
        let isSubscribed = false;
        
        if (tempuser) {
            isLoggedIn = true;
            user = await User.findOne({ username: tempuser.username });
            if (user) {
                const { subscription } = user;
                if (subscription && subscription.startDate && subscription.endDate) {
                    const currentDate = Date.now();
                    const startDate = new Date(subscription.startDate).getTime();
                    const endDate = new Date(subscription.endDate).getTime();
                    isSubscribed = currentDate >= startDate && currentDate <= endDate;
                }
            }
        }

        // Send JSON data
        res.status(200).json({
            isLoggedIn,
            isSubscribed,
            username: user ? user.username : null
        });
    } catch (error) {
        console.error("Error in fetch-popup route:", error);
        res.status(500).send("Server Error: Unable to fetch popup content.");
    }
});

module.exports = router;
