require("dotenv").config();

const express = require("express");
const webhookRouter = require("./routes/webhook");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/webhook", webhookRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook endpoint: POST http://localhost:${PORT}/webhook/bolna`);
});

module.exports = app;
