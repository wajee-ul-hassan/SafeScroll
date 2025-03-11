const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const errorTitle = req.query.error_title || "Unexpected Error";
    const statusCode = req.query.status_code || 500;
    const errorMessage = req.query.error || "An unexpected error occurred. Please try again later.";

    res.status(parseInt(statusCode)).render('error', {
        error_title: errorTitle,
        status_code: parseInt(statusCode),
        error: errorMessage
    });
});

module.exports = router;