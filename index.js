const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const stripe = require("stripe")("sk_test_51QP5HeP0df5kgPelNQGK7TSyvBmOBu5fQAwUmWTHVsMbg7h4xtmPgLL6fCcsyGYRrjektNxbB5dGqKmxe4xmIBOr00kDdGTjs0");
// Import your route modules
const signinRouter = require('./routes/signin');
const popupRouter = require('./routes/popup');
const signupRouter = require('./routes/signup');
const emailRouter = require('./routes/email');
const forgetpasswordRouter = require('./routes/forgetpassword'); // Destructure to get the router
const subscriptionRouter = require('./routes/subscription');
const dashboardRouter = require('./routes/dashboard');
const errorRouter = require('./routes/error');
const logoutRouter = require('./routes/logout');
const manageprofileRouter=require('./routes/manageprofile');
const cors = require('cors');
const app = express();

// Connect to MongoDB
require("./config/connect");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


// Route management
app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/email-page', emailRouter);
app.use('/forgetpassword', forgetpasswordRouter);
app.use('/subscribe', subscriptionRouter);
app.use('/dashboard', dashboardRouter);
app.use('/error', errorRouter);
app.use('/popup', popupRouter);
app.use('/logout', logoutRouter);
app.use('/manageprofile',manageprofileRouter);

app.get("/", (req, res) => {
  res.render("signin");
});

app.use((req, res, next) => {
  res.status(404).render('error', {
    error_title: "Error 404",
    status_code: 404,
    error: "The page you are looking for does not exist.",
  });
});

app.use(cors({
  origin: 'chrome-extension://kdfbjhgfobhcnlgilleefogemmmjkhkk',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
