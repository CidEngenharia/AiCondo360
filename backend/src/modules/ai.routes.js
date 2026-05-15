const express = require("express");
const router = express.Router();
const { askAI } = require("./ai.service");

router.post("/", askAI);

module.exports = router;