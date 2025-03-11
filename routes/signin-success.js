const express = require("express");
const path = require("path");
const authenticateToken = require("../middlewares/auth");
const User = require("../models/user");
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const username = req.user ? req.user.username : undefined;
        if (!username) {
            return res.redirect('/signin');
        }

        const user = await User.findOne({ email: req.user.email });
        let isSubscribed = false;
        
        if (user.subscription && user.subscription.startDate && user.subscription.endDate) {
            const currentDate = Date.now();
            const startDate = new Date(user.subscription.startDate).getTime();
            const endDate = new Date(user.subscription.endDate).getTime();
            isSubscribed = currentDate >= startDate && currentDate <= endDate;
        }

        res.render('signin-success', { isSubscribed });
    } catch (error) {
        console.error('Error checking subscription:', error);
        res.render('signin-success', { isSubscribed: false });
    }
});

module.exports = router;
