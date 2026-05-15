const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// rotas
app.use("/api/ai", require("./modules/ai/ai.routes"));
app.use("/api/billing", require("./modules/billing/billing.routes"));

module.exports = app;