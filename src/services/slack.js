const axios = require("axios");

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function truncate(text, maxLength = 2800) {
  if (!text) return "_No transcript available_";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

function buildSlackPayload(callData) {
  const {
    id,
    agent_id,
    status,
    transcript,
    conversation_time,
    telephony_data = {},
    created_at,
  } = callData;

  const durationSeconds = telephony_data.duration ?? conversation_time ?? null;
  const durationStr = formatDuration(durationSeconds);
  const callType = telephony_data.call_type ?? "N/A";
  const toNumber = telephony_data.to_number ?? "N/A";
  const fromNumber = telephony_data.from_number ?? "N/A";

  const callTime = created_at
    ? new Date(created_at).toLocaleString("en-US", { timeZone: "UTC" }) + " UTC"
    : "N/A";

  const statusEmoji =
    status === "completed" ? "✅" : status === "failed" ? "❌" : "⚠️";

  return {
    text: `📞 Bolna Call Ended — ${statusEmoji} ${status?.toUpperCase()} | ID: ${id}`,

    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📞 Bolna Call Ended",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Status*\n${statusEmoji} ${status?.toUpperCase() ?? "UNKNOWN"}`,
          },
          {
            type: "mrkdwn",
            text: `*Time*\n${callTime}`,
          },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*ID*\n\`${id ?? "N/A"}\``,
          },
          {
            type: "mrkdwn",
            text: `*Agent ID*\n\`${agent_id ?? "N/A"}\``,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Duration*\n${durationStr}`,
          },
          {
            type: "mrkdwn",
            text: `*Call Type*\n${callType}`,
          },
          {
            type: "mrkdwn",
            text: `*From*\n${fromNumber}`,
          },
          {
            type: "mrkdwn",
            text: `*To*\n${toNumber}`,
          },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📝 Transcript*\n${truncate(transcript)}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Powered by *Bolna Voice AI* | <https://platform.bolna.ai|Open Dashboard>`,
          },
        ],
      },
    ],
  };
}

async function sendSlackAlert(callData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL is not configured in environment variables.");
  }

  const payload = buildSlackPayload(callData);

  const response = await axios.post(webhookUrl, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 10_000,
  });

  return response;
}

module.exports = { sendSlackAlert };
