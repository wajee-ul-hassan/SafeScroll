const express = require("express");
const authenticateToken = require('../middlewares/auth');
const cookieParser = require('cookie-parser');

const router = express.Router();

// Render the dashboard
router.get("/", authenticateToken, (req, res) => {
    res.render("dashboard");
});

module.exports = router;
