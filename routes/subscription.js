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
      res.redirect('/dashboard');
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
      errorTitle = "Error 404";
      errorMessage = "User not Found"
      statusCode = 404;
      res.status(statusCode).render('error', {
        error_title: errorTitle,
        status_code: statusCode,
        error: errorMessage
      });
    }
  } catch (error) {
    errorTitle = "Error 500";
    errorMessage = "An error occurred while subscription"
    statusCode = 500;
    res.status(statusCode).render('error', {
      error_title: errorTitle,
      status_code: statusCode,
      error: errorMessage
    });
  }
});
// Render the subscription page
router.get("/verify-payment", authenticateToken, async (req, res) => {
  try {
    const username = req.query.username;
    const sessionID = req.query.sessionID;

    if (!username || !sessionID) {
      const errorTitle = "Error 404";
      const errorMessage = "Page not Found.";
      const statusCode = 404;
      return res.status(statusCode).render('error', {
        error_title: errorTitle,
        status_code: statusCode,
        error: errorMessage
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
        errorTitle = "Error 404";
        errorMessage = "User not found."
        statusCode = 404;
        return res.status(statusCode).render('error', {
          error_title: errorTitle,
          status_code: statusCode,
          error: errorMessage
        });
      }
      user.subscription = {
        startDate: startDate,
        endDate: endDate,
      };

      await user.save();
      res.redirect("/dashboard");
    } else {
      // Payment was not successful
      console.error('Payment was not successful:', session.payment_status);
      res.redirect('/subscribe');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    errorTitle = "Error 500";
    errorMessage = "An error occurred while subscription"
    statusCode = 500;
    res.status(statusCode).render('error', {
      error_title: errorTitle,
      status_code: statusCode,
      error: errorMessage
    });
  }
});
module.exports = router;
