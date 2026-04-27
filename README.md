# Bolna → Slack Integration

An Express.js webhook server that listens for [Bolna](https://bolna.ai) call-end events and forwards a rich alert to a Slack channel using [Slack Incoming Webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks).

---

## How it works

```
Bolna call ends
      │
      ▼
POST /webhook/bolna   ← this server
      │
      │  extracts: id, agent_id, duration, transcript
      │
      ▼
Slack Incoming Webhook
      │
      ▼
Slack channel alert 📨
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 18 | `node --version` |
| Bolna account | [platform.bolna.ai](https://platform.bolna.ai) |
| Slack app with Incoming Webhooks enabled | [api.slack.com/apps](https://api.slack.com/apps) |
| Publicly reachable URL | Use [ngrok](https://ngrok.com) for local dev |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../XXX
PORT=3000
```

### 3. Run the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:3000`.

---

## Setting up Slack Incoming Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. In **Features**, click **Incoming Webhooks** → toggle **Activate Incoming Webhooks** ON
3. Click **Add New Webhook to Workspace**, choose a channel, then **Allow**
4. Copy the generated URL (e.g. `https://hooks.slack.com/services/T.../B.../XXX`) into your `.env`

---

## Setting up Bolna Webhook

1. Log in to [platform.bolna.ai](https://platform.bolna.ai)
2. Open the agent you want to monitor
3. Go to the **Analytics Tab**
4. Paste your public webhook URL into the **Webhook URL** field:
   ```
   https://<your-domain-or-ngrok>/webhook/bolna
   ```
5. Save the agent

> **Local development tip:** Use [ngrok](https://ngrok.com) to expose your local server:
> ```bash
> ngrok http 3000
> # Copy the https://xxxx.ngrok-free.app URL into Bolna
> ```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/webhook/bolna` | Receives Bolna call events |
| `GET` | `/health` | Health check |

### Webhook payload (sent by Bolna)

```json
{
  "id": "4c06b4d1-4096-4561-919a-4f94539c8d4a",
  "agent_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "status": "completed",
  "transcript": "Agent: Hello! How can I help you?...",
  "conversation_time": 123,
  "telephony_data": {
    "duration": 42,
    "to_number": "+10123456789",
    "from_number": "+19876543007",
    "call_type": "outbound",
    "hangup_by": "Caller",
    "hangup_reason": "Normal Hangup"
  }
}
```

### Slack alert triggers on these statuses

`completed` · `call-disconnected` · `failed` · `canceled` · `no-answer` · `busy` · `error` · `stopped` · `balance-low`

Non-terminal statuses (e.g. `ringing`, `in-progress`) are acknowledged but **no Slack message is sent**.

---

## Test the webhook locally

```bash
curl -X POST http://localhost:3000/webhook/bolna \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-call-001",
    "agent_id": "d311e737-70e6-4075-bef6-c0ef3a7026b4",
    "status": "completed",
    "transcript": "Agent: Hi! This is a test call.\nUser: Got it, thanks!",
    "conversation_time": 45,
    "created_at": "2024-06-01T10:00:00Z",
    "telephony_data": {
      "duration": 45,
      "call_type": "outbound",
      "to_number": "+911234567890",
      "from_number": "+19876543007",
      "hangup_by": "Agent",
      "hangup_reason": "Normal Hangup"
    }
  }'
```

---

## Project Structure

```
bolna-task/
├── src/
│   ├── index.js            # Express app entry point
│   ├── routes/
│   │   └── webhook.js      # POST /webhook/bolna handler
│   └── services/
│       └── slack.js        # Slack Block Kit message builder & sender
├── .env.example            # Environment variable template
├── .gitignore
├── package.json
└── README.md
```
