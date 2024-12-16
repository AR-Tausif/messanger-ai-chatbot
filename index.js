const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(bodyParser.json());

// Verify webhook
app.get("/webhook", (req, res) => {
  console.log("Webhook verification request received.");
  console.log(JSON.stringify(req.query));
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle messages
app.post("/webhook", async (req, res) => {
  const body = req.body;
  console.log(JSON.stringify(body))
  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      const senderId = webhookEvent.sender.id;
      if (webhookEvent.message) {
        const message = webhookEvent.message.text;
        sendMessage(senderId, `You said: ${message}`);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Send message function
async function sendMessage(recipientId, text) {
  const url = `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = {
    recipient: { id: recipientId },
    message: { text }
  };

  try {
    console.log("Sending Message!");
    await axios.post(url, payload);
    console.log("Message sent!");
  } catch (error) {
    console.error("Error sending message:", error.response.data);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
