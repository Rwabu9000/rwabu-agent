// ─── EXPRESS SERVER INSTANCE ──────────────────────────────────────────────────
const express = require('express');
const app = express();

app.use(express.json());

// 1. Health Check Endpoint (For Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok", agent: "Rwabu AI" });
});

// 2. Meta Webhook Verification Check (GET)
app.get('/webhook', (req, res) => {
  verifyWebhook(req, res);
});

// 3. Incoming WhatsApp Messages Endpoint (POST)
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const fromNumber = message.from; // User phone number
      const textBody = message.text?.body; // User's message text

      if (textBody) {
        // Run your handler async so Meta gets an instant 200 OK receipt
        handleIncoming(fromNumber, textBody).catch(err => {
          console.error("Error processing message:", err);
        });
      }
    }
    
    // Always send a 200 back to WhatsApp instantly so they don't retry sending
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing crash:", error);
    res.sendStatus(500);
  }
});

// Start listening dynamically on Railway's assigned port
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Rwabu AI Agent listening globally on port ${PORT}`);
});