const express = require("express");
const authenticateToken = require('../middlewares/auth');
const cookieParser = require('cookie-parser');
const User = require('../models/user');

const router = express.Router();
let dashboardImages = [];
router.get("/", authenticateToken, async (req, res) => {
    try {
        const tempuser = req.user;
        if (!tempuser) {
            return res.status(404).render('error', {
                error_title: "Authentication Required",
                status_code: 404,
                error: "We couldn't find your user session. Please sign in again to access your dashboard. If you don't have an account yet, you can create one through the SafeScroll extension popup."
            });
        }
        const username = tempuser.username;
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).render('error', {
                error_title: "Account Not Found",
                status_code: 404,
                error: "We couldn't find your account in our system. This might happen if your account was recently deleted or if there's a temporary issue. Please try signing out and signing in again through the SafeScroll extension popup. If the problem persists, you may need to create a new account."
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
                error_title: "Subscription Required",
                status_code: 403,
                error: "Access to the dashboard requires an active subscription. You can subscribe through the extension popup."
            });
        }

        // For now, we'll just pass an empty array for localImages
        // The actual implementation will need to be handled client-side
        res.render("dashboard", { 
            images: dashboardImages,
            isSubscribed,
        });
    } catch (error) {
        console.error("Error in GET /:", error);
        res.status(500).render('error', {
            error_title: "Temporary Service Disruption",
            status_code: 500,
            error: "We're experiencing some technical difficulties at the moment. Our team has been notified and is working to resolve this issue. We apologize for any inconvenience."
        });
    }
});

router.post('/', (req, res) => {
    const { images } = req.body;
    if (images && Array.isArray(images)) {
      dashboardImages = images;
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid image data' });
    }
  });

module.exports = router;
