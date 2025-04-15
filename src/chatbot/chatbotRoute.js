const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('./chatbot');

/**
 * POST /api/chatbot
 * Expects a JSON body with { message: "user message" }
 * Returns a JSON response with the chatbot's reply.
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing message parameter' });
    }
    const response = await getChatbotResponse(message);
    res.json({ reply: response });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
