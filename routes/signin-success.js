const express = require("express");
const path = require("path");
const authenticateToken = require("../middlewares/auth");
const router = express.Router();

router.get('/',authenticateToken, (req, res) => {
    username = req.user ? req.user.username : undefined;
    if (!username) {
        return res.redirect('/signin');
    }
    res.render('signin-success');
});

module.exports = router;
