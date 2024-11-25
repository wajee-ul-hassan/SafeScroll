const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const stripe = require("stripe")("sk_test_51QP5HeP0df5kgPelNQGK7TSyvBmOBu5fQAwUmWTHVsMbg7h4xtmPgLL6fCcsyGYRrjektNxbB5dGqKmxe4xmIBOr00kDdGTjs0");


// Mock user data
let users = {
  user1: {
    email: "user1@example.com",
    subscribed: false,
  },
};

// Import your route modules
const signinRouter = require('./routes/signin');
const signupRouter = require('./routes/signup');
const { router: emailRouter } = require('./routes/email'); // Destructure to get the router
const forgetpasswordRouter = require('./routes/forgetpassword'); // Destructure to get the router

const app = express();

// Connect to MongoDB
require("./config/connect");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// Route management
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/email-page', emailRouter);
app.use('/forgetpassword',forgetpasswordRouter)


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/subscribe", (req, res) => {
  res.render("subscription", {
    stripePublicKey: "pk_test_51QP5HeP0df5kgPel0wdS65oClsAydXltNxMNgUSqFXg9AQKKGq97S6ROthklCR3bIpqVStB2DRfSKH8fMScH8dGj00kMlRNSKv",
  });
});

// Stripe Checkout
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1QP5eXP0df5kgPeln24TSiuh", // Stripe price ID from your dashboard
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/dashboard",
      cancel_url: "http://localhost:3000/subscribe",
    });
    res.redirect(303, session.url);
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).send("An error occurred");
  }
});

// Dashboard (restricted to subscribers)
app.get("/dashboard", (req, res) => {
  const user = users.user1; // Mock user data
  if (user.subscribed) {
    res.render("dashboard", { memes: [] }); // Pass blocked memes in the future
  } else {
    res.redirect("/subscribe");
  }
});

// Simulate subscription success
app.get("/subscription-success", (req, res) => {
  users.user1.subscribed = true; // Update user subscription status
  res.redirect("/dashboard");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
