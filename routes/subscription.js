const express = require("express");
const authenticateToken = require('../middlewares/auth');
const cookieParser = require('cookie-parser');
const stripe = require("stripe")("sk_test_51QP5HeP0df5kgPelNQGK7TSyvBmOBu5fQAwUmWTHVsMbg7h4xtmPgLL6fCcsyGYRrjektNxbB5dGqKmxe4xmIBOr00kDdGTjs0");
const User = require('../models/user');

const router = express.Router();
let username;

// Render the subscription page
router.get("/", authenticateToken, async (req, res) => {
  username = req.user ? req.user.username : undefined;
  let isSubscribed = false;
  if (username) {
    const user = await User.findOne({ username: username });
    const { subscription } = user;
    if (subscription && subscription.startDate && subscription.endDate) {
      const currentDate = Date.now();
      const startDate = new Date(subscription.startDate).getTime();
      const endDate = new Date(subscription.endDate).getTime();

      isSubscribed = currentDate >= startDate && currentDate <= endDate;
    }
    if (!isSubscribed) {
      res.render("subscription", {
        stripePublicKey: "pk_test_51QP5HeP0df5kgPel0wdS65oClsAydXltNxMNgUSqFXg9AQKKGq97S6ROthklCR3bIpqVStB2DRfSKH8fMScH8dGj00kMlRNSKv",
      });
    }
    else {
      res.render('subscription-success');
    }
  } else {
    res.redirect('/signin');
  }
});

// Stripe Checkout
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const tempuser = req.user;
    if (tempuser !== null) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: "price_1QP5eXP0df5kgPeln24TSiuh",
            quantity: 1,
          },
        ],
        success_url: `http://localhost:3000/subscribe/verify-payment?username=${username}&sessionID={CHECKOUT_SESSION_ID}`,
        cancel_url: "http://localhost:3000/subscribe",
      });
      res.status(200).json({ url: session.url });
    }
    else {
      return res.status(404).render('error', {
        error_title: "Authentication Required",
        status_code: 404,
        error: "Please sign in to complete your subscription purchase. If you're already signed in, try signing out and back in."
      });
    }
  } catch (error) {
    return res.status(500).render('error', {
      error_title: "Payment Processing Error",
      status_code: 500,
      error: "We encountered an issue while processing your subscription payment. Please try again or contact support if the problem persists."
    });
  }
});
// Render the subscription page
router.get("/verify-payment", authenticateToken, async (req, res) => {
  try {
    const username = req.query.username;
    const sessionID = req.query.sessionID;

    if (!username || !sessionID) {
      return res.status(404).render('error', {
        error_title: "Invalid Payment Verification",
        status_code: 404,
        error: "We couldn't verify your payment because some required information is missing. Please try the subscription process again."
      });
    }

    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionID);

    if (session.payment_status === 'paid') {
      // Set subscription start and end dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1); // Add one month
      const user = await User.findOne({ username: username });
      
      if (!user) {
        return res.status(404).render('error', {
          error_title: "Account Not Found",
          status_code: 404,
          error: "We couldn't find your account to activate the subscription. Please contact support for assistance."
        });
      }
      
      user.subscription = {
        startDate: startDate,
        endDate: endDate,
      };

      await user.save();
      // Render success page instead of redirecting to dashboard
      res.render('subscription-success');
    } else {
      // Payment was not successful
      console.error('Payment was not successful:', session.payment_status);
      res.redirect('/subscribe');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).render('error', {
      error_title: "Subscription Activation Error",
      status_code: 500,
      error: "We had trouble activating your subscription. If your payment was successful, please contact support to resolve this issue."
    });
  }
});
module.exports = router;
