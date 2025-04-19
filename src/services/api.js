const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// API keys – replace these with real values or load them via environment variables in production
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'your_weather_api_key';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your_news_api_key';
const JOBS_API_KEY = process.env.JOBS_API_KEY || 'your_jobs_api_key';
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY || 'your_currency_api_key';

// Initialize cache
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 10 minutes

// ============ Weather API ============
router.get('/weather', async (req, res) => {
  try {
    let endpoint = '';
    const { lat, lon, location } = req.query;
    const cacheKey = `weather_${lat}_${lon}_${location}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log('Serving weather data from cache');
      return res.json(cachedData);
    }

    if (lat && lon) {
      endpoint = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;
    } else if (location) {
      endpoint = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}`;
    } else {
      return res.status(400).json({ error: 'Missing location parameters' });
    }

    const response = await axios.get(endpoint);
    cache.set(cacheKey, response.data); // Store in cache
    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    // Provide demo data in development mode
    if (process.env.NODE_ENV === 'development') {
      return res.json(getWeatherDemoData());
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch weather data',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// ============ Jobs API ============
router.get('/jobs', async (req, res) => {
  try {
    const { keywords, location } = req.query;
    const cacheKey = `jobs_${keywords}_${location}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log('Serving jobs data from cache');
      return res.json(cachedData);
    }

    if (!keywords && !location) {
      return res.status(400).json({ error: 'Please provide search keywords or location' });
    }

    // Example using a job search API (e.g., RapidAPI's JSSearch)
    const endpoint = 'https://jsearch.p.rapidapi.com/search';
    const params = {
      query: `${keywords || ''} ${location || ''}`.trim(),
      page: 1,
      num_pages: 1,
    };

    const response = await axios.get(endpoint, {
      params,
      headers: {
        'X-RapidAPI-Key': JOBS_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    // Map and format jobs to match frontend expectations
    const jobs = response.data.data.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_country,
      description: job.job_description ? job.job_description.slice(0, 200) + '...' : '',
      salary: job.job_min_salary ? `${job.job_min_salary}-${job.job_max_salary} ${job.job_salary_currency}` : null,
      type: job.job_employment_type,
      url: job.job_apply_link
    }));

    const responseData = { jobs };
    cache.set(cacheKey, responseData); // Store in cache
    res.json(responseData);
  } catch (error) {
    console.error('Jobs API error:', error.response?.data || error.message);
    // Provide demo job listings in development mode
    if (process.env.NODE_ENV === 'development') {
      return res.json({ jobs: getJobsDemoData() });
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch job listings',
      message: error.response?.data?.message || error.message
    });
  }
});

// ============ News API ============
router.get('/news', async (req, res) => {
  try {
    const { category = 'general' } = req.query;
    const cacheKey = `news_${category}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log('Serving news data from cache');
      return res.json(cachedData);
    }

    const endpoint = 'https://newsapi.org/v2/top-headlines';
    const params = {
      category,
      language: 'en',
      apiKey: NEWS_API_KEY
    };

    const response = await axios.get(endpoint, { params });
    cache.set(cacheKey, response.data); // Store in cache
    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    // Provide demo news articles in development mode
    if (process.env.NODE_ENV === 'development') {
      return res.json({ articles: getNewsDemoData() });
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch news articles',
      message: error.response?.data?.message || error.message
    });
  }
});

// ============ Currency API ============
router.get('/currency', async (req, res) => {
  try {
    const cacheKey = 'currency';
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log('Serving currency data from cache');
      return res.json(cachedData);
    }

    const endpoint = 'https://api.exchangerate.host/latest';
    const response = await axios.get(endpoint);
    cache.set(cacheKey, response.data); // Store in cache
    res.json(response.data);
  } catch (error) {
    console.error('Currency API error:', error.response?.data || error.message);
    // Provide demo exchange rate data in development mode
    if (process.env.NODE_ENV === 'development') {
      return res.json(getCurrencyDemoData());
    }
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch exchange rates',
      message: error.response?.data?.message || error.message
    });
  }
});

// ============ Demo Data Functions ============

/**
 * Get demo weather data for development
 */
function getWeatherDemoData() {
  return {
    location: {
      name: 'New York',
      country: 'USA'
    },
    current: {
      temp_c: 22.5,
      feelslike_c: 23.1,
      humidity: 65,
      wind_kph: 8.6,
      uv: 4,
      condition: {
        text: 'Partly cloudy',
        icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png'
      }
    }
  };
}

/**
 * Get demo job listings for development
 */
function getJobsDemoData() {
  return [
    {
      id: 'job1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'New York, NY',
      description: 'We are looking for a talented Frontend Developer with experience in React, JavaScript, and CSS to join our team.',
      salary: '$80,000-$120,000 USD',
      type: 'Full-time',
      url: '#'
    },
    {
      id: 'job2',
      title: 'Backend Engineer',
      company: 'DataSystems Inc',
      location: 'Remote',
      description: 'Experienced backend developer needed to build scalable APIs and implement database solutions.',
      salary: '$90,000-$140,000 USD',
      type: 'Full-time',
      url: '#'
    },
    {
      id: 'job3',
      title: 'UX/UI Designer',
      company: 'CreativeHub',
      location: 'San Francisco, CA',
      description: 'Looking for a creative designer with a passion for creating beautiful and intuitive user experiences.',
      salary: '$75,000-$110,000 USD',
      type: 'Full-time',
      url: '#'
    },
    {
      id: 'job4',
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Austin, TX',
      description: 'Join our team to build and maintain our cloud infrastructure and deployment pipelines.',
      salary: '$95,000-$130,000 USD',
      type: 'Full-time',
      url: '#'
    },
    {
      id: 'job5',
      title: 'Data Analyst',
      company: 'AnalyticsPro',
      location: 'Chicago, IL',
      description: 'Seeking a data analyst to help transform raw data into valuable business insights.',
      salary: '$70,000-$90,000 USD',
      type: 'Full-time',
      url: '#'
    }
  ];
}

/**
 * Get demo news articles for development
 */
function getNewsDemoData() {
  return [
    {
      source: { id: 'tech-daily', name: 'Tech Daily' },
      author: 'Jane Smith',
      title: 'New AI Model Breaks Records in Image Recognition',
      description: 'Researchers have developed a groundbreaking AI system that can identify objects in images with unprecedented accuracy.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/600x400?text=AI+Technology',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      content: 'Full article content here...'
    },
    {
      source: { id: 'business-insider', name: 'Business Insider' },
      author: 'John Doe',
      title: 'Tech Stocks Surge as Market Rebounds',
      description: 'Major tech companies saw their stock prices rise dramatically as the market recovered from recent losses.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/600x400?text=Stock+Market',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      content: 'Full article content here...'
    },
    {
      source: { id: 'health-news', name: 'Health News' },
      author: 'Dr. Lisa Johnson',
      title: 'New Study Shows Benefits of Mediterranean Diet',
      description: 'Research confirms that following a Mediterranean diet can lead to significant health improvements.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/600x400?text=Healthy+Food',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      content: 'Full article content here...'
    },
    {
      source: { id: 'sports-center', name: 'Sports Center' },
      author: 'Mike Williams',
      title: 'Local Team Advances to Championship Finals',
      description: 'After a thrilling victory in the semifinals, the local team will compete for the championship next week.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/600x400?text=Sports+Championship',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      content: 'Full article content here...'
    },
    {
      source: { id: 'science-daily', name: 'Science Daily' },
      author: 'Dr. Robert Chen',
      title: 'Astronomers Discover New Exoplanet in Habitable Zone',
      description: 'Scientists have found a potentially habitable planet orbiting a star just 40 light years away.',
      url: '#',
      urlToImage: 'https://via.placeholder.com/600x400?text=Exoplanet',
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      content: 'Full article content here...'
    }
  ];
}

/**
 * Get demo currency exchange data for development
 */
function getCurrencyDemoData() {
  return {
    base: 'EUR',
    date: new Date().toISOString().split('T')[0],
    rates: {
      USD: 1.1,
      GBP: 0.85,
      EUR: 1,
      INR: 88.5
    }
  };
}

module.exports = router;

// In backend/server.js (or your main API router file)

const app = express();
// ... other middleware and routes

// Make sure body parsing middleware is enabled to handle JSON
app.use(express.json());

// Existing API routes
const apiRoutes = require('./api'); // your existing API routes
app.use('/api', apiRoutes);

// Mount the chatbot route (assuming you created chatbotRoute.js in /src/chatbot/)
const chatbotRoute = require('../chatbot/chatbotRoute');
app.use('/api/chatbot', chatbotRoute);

// ... rest of your server.js code (error handling, static file serving, etc.)
