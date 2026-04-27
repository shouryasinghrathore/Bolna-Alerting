const express = require("express");
const { sendSlackAlert } = require("../services/slack");

const router = express.Router();


router.post("/bolna", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid payload: expected a JSON object." });
    }

    const { id, agent_id, status } = payload;

    if (!id || !agent_id) {
      return res
        .status(400)
        .json({ error: "Invalid payload: missing required fields (id, agent_id)." });
    }

    console.log(`[Bolna Webhook] Received event — id: ${id}, status: ${status}`);

    if (status == "completed") {
      await sendSlackAlert(payload);
      return res.status(200).json({ message: "Slack alert sent successfully." });
    }

    return res.status(200).json({ message: "Slack alert not sent successfully." });

  } catch (err) {
    console.error("Error processing webhook:", err.message);

    if (err.response) {
      console.error("Slack API Response:", err.response.status, err.response.data);
    }

    return res.status(500).json({ error: "Internal server error while processing webhook." });
  }
});

module.exports = router;
