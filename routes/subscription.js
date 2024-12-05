const express = require("express");
const authenticateToken = require('../middlewares/auth');
const cookieParser = require('cookie-parser');
const stripe = require("stripe")("sk_test_51QP5HeP0df5kgPelNQGK7TSyvBmOBu5fQAwUmWTHVsMbg7h4xtmPgLL6fCcsyGYRrjektNxbB5dGqKmxe4xmIBOr00kDdGTjs0");
const User = require('../models/user');

const router = express.Router();
let username;

// Render the subscription page
router.get("/", authenticateToken, (req, res) => {
  username = req.user ? req.user.username : undefined; // Ensure req.user is checked before accessing username
  if (username) {
    res.render("subscription", {
      stripePublicKey: "pk_test_51QP5HeP0df5kgPel0wdS65oClsAydXltNxMNgUSqFXg9AQKKGq97S6ROthklCR3bIpqVStB2DRfSKH8fMScH8dGj00kMlRNSKv",
    });
  } else {
    res.render("signin");
  }
});

// Stripe Checkout
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1QP5eXP0df5kgPeln24TSiuh", // Replace with your Stripe price ID
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/subscribe/success",
      cancel_url: "http://localhost:3000/subscribe",
    });
    res.redirect(303, session.url);
  } catch (error) {
    errorTitle = "Error 500";
    errorMessage = "Internal Server Error."
    statusCode = 500;
    res.status(statusCode).render('error', {
      error_title: errorTitle,
      status_code: statusCode,
      error: errorMessage
    });
  }
});

router.get("/success", async (req, res) => {
  try {
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

    // Set subscription start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1); // Add one month

    user.subscription = {
      startDate: startDate,
      endDate: endDate,
    };

    await user.save();

    res.redirect("/dashboard"); // Redirect to dashboard after subscription
  } catch (error) {
    errorTitle = "Error 500";
    errorMessage = "An error occurred while updating subscription"
    statusCode = 500;
    res.status(statusCode).render('error', {
      error_title: errorTitle,
      status_code: statusCode,
      error: errorMessage
    });
  }
});

module.exports = router;
