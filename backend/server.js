const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes (import from /src/services/api.js)
const apiRoutes = require('../src/services/api');
app.use('/api', apiRoutes);

// Mount the chatbot route (located in /src/chatbot/chatbotRoute.js)
const chatbotRoute = require('../src/chatbot/chatbotRoute');
app.use('/api/chatbot', chatbotRoute);

// Fallback route: Serve index.html for any unmatched route (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Initialize AI Agent tasks
const aiAgent = require('../src/ai/aiAgent');
aiAgent.init();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});

module.exports = app;
