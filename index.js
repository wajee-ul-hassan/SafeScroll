const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const stripe = require("stripe")("sk_test_51QP5HeP0df5kgPelNQGK7TSyvBmOBu5fQAwUmWTHVsMbg7h4xtmPgLL6fCcsyGYRrjektNxbB5dGqKmxe4xmIBOr00kDdGTjs0");

// Import your route modules
const signinRouter = require('./routes/signin');
const signupRouter = require('./routes/signup');
const emailRouter = require('./routes/email');
const forgetpasswordRouter = require('./routes/forgetpassword'); // Destructure to get the router
const subscriptionRouter = require('./routes/subscription');
const dashboardRouter=require('./routes/dashboard');
const errorRouter = require('./routes/error');

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
app.use('/forgetpassword',forgetpasswordRouter);
app.use('/subscribe', subscriptionRouter);
app.use('/dashboard',dashboardRouter);
app.use('/error',errorRouter)


app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
