const express = require("express");
const router = express.Router();

router.get("/plan", (req, res) => {
    res.json({
        plan: "free",
        limit: 10
    });
});

module.exports = router;