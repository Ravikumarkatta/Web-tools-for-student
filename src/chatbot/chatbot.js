/**
 * chatbot.js
 *
 * This module implements a simple chatbot logic.
 * It processes user messages and returns a response.
 * Replace or extend this implementation with actual AI model integration.
 */

/**
 * Process a user message and return a chatbot response.
 * @param {string} message - The user's message.
 * @returns {Promise<string>} - A promise that resolves to the chatbot's response.
 */
function getChatbotResponse(message) {
  return new Promise((resolve) => {
    const lowerCaseMsg = message.toLowerCase();
    let response = "";

    if (lowerCaseMsg.includes("weather")) {
      response = "It looks like you're asking about the weather. Would you like to see the current forecast?";
    } else if (lowerCaseMsg.includes("news")) {
      response = "I've got some fresh news updates. Which category interests you most?";
    } else if (lowerCaseMsg.includes("job")) {
      response = "I can help with job searches. What kind of job are you interested in?";
    } else if (lowerCaseMsg.includes("currency") || lowerCaseMsg.includes("exchange")) {
      response = "I can assist with currency conversion. Which currencies would you like to check?";
    } else {
      response = "I'm here to help! Could you please clarify your request?";
    }

    // Simulate asynchronous processing delay (e.g., model inference)
    setTimeout(() => {
      resolve(response);
    }, 1000);
  });
}

module.exports = {
  getChatbotResponse,
};
