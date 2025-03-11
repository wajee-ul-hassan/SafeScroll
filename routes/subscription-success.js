const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authenticateToken = require("../middlewares/auth");
const User = require("../models/user");
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

// Helper function to check subscription status
async function checkSubscriptionStatus(username) {
    try {
        const user = await User.findOne({ username: username });
        const { subscription } = user;
        let isSubscribed = false;
        if (subscription && subscription.startDate && subscription.endDate) {
            const currentDate = Date.now();
            const startDate = new Date(subscription.startDate).getTime();
            const endDate = new Date(subscription.endDate).getTime();

            isSubscribed = currentDate >= startDate && currentDate <= endDate;
        }
        return isSubscribed;
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
}

app.get('/', authenticateToken, async (req, res) => {
    username = req.user ? req.user.username : undefined;
    if (!username) {
        return res.redirect('/signin');
    }
    try {
        const isSubscribed = await checkSubscriptionStatus(username);

        if (!isSubscribed) {
            // If user is not subscribed, redirect to subscription page
            return res.redirect('/subscribe');
        }

        // Set cache control headers to prevent back button from showing this page
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.render('subscription-success');
    } catch (error) {
        console.error('Error in subscription success route:', error);
        res.status(500).redirect('/signin');
    }
});

module.exports = app;

