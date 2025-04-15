// config.js
// Load environment variables from the .env file (for development)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Weather API configuration
  weatherApiKey: process.env.WEATHER_API_KEY || 'your_weather_api_key',
  weatherApiUrl: process.env.WEATHER_API_URL || 'http://api.weatherapi.com/v1/current.json',
  defaultLocation: process.env.DEFAULT_LOCATION || 'New York',

  // News API configuration
  newsApiKey: process.env.NEWS_API_KEY || 'your_news_api_key',
  newsApiUrl: process.env.NEWS_API_URL || 'https://newsapi.org/v2/top-headlines',

  // Jobs API configuration (if applicable)
  jobsApiKey: process.env.JOBS_API_KEY || 'your_jobs_api_key',

  // Currency API configuration (if applicable)
  currencyApiKey: process.env.CURRENCY_API_KEY || 'your_currency_api_key',

  // Email service configuration
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER || 'your_email@gmail.com',
  emailPass: process.env.EMAIL_PASS || 'your_email_password',
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'your_email@gmail.com',
  emailDefaultRecipient: process.env.EMAIL_DEFAULT_RECIPIENT || 'recipient@example.com',
};

module.exports = config;
