const express = require("express");
const authenticateToken = require('../middlewares/auth');
const cookieParser = require('cookie-parser');
const User = require('../models/user');

const router = express.Router();

// Render the dashboard
router.get("/", authenticateToken, async (req, res) => {
    try {
        const tempuser = req.user;
        if (!tempuser) {
            return res.status(404).render('error', {
                error_title: "Error 404",
                status_code: 404,
                error: "User not found."
            });
        }
        const username = tempuser.username;
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).render('error', {
                error_title: "Error 404",
                status_code: 404,
                error: "User not found."
            });
        }
        let isSubscribed = false;
        const { subscription } = user;

        if (subscription?.startDate && subscription?.endDate) {
            const currentDate = Date.now();
            const startDate = new Date(subscription.startDate).getTime();
            const endDate = new Date(subscription.endDate).getTime();

            isSubscribed = currentDate >= startDate && currentDate <= endDate;
        }

        if (!isSubscribed) {
            return res.status(403).render('error', {
                error_title: "Error 403",
                status_code: 403,
                error: "User not Subscribed."
            });
        }

        res.render("dashboard");
    } catch (error) {
        console.error("Error in GET /:", error);
        res.status(500).render('error', {
            error_title: "Error 500",
            status_code: 500,
            error: "Internal Server Error."
        });
    }
});


module.exports = router;
