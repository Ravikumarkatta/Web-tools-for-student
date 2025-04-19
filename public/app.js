document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
  loadDashboardData();
});

/* ---------------------- Initialization ---------------------- */
function initApp() {
  // Theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) darkToggle.checked = true;
  }
  
  // Temperature unit
  const tempUnit = localStorage.getItem('tempUnit') || 'celsius';
  const tempUnitInput = document.querySelector(`input[name="temp-unit"][value="${tempUnit}"]`);
  if (tempUnitInput) tempUnitInput.checked = true;
  
  // Initialize chart if present
  if (document.getElementById('exchange-rate-chart')) {
    initExchangeRateChart();
  }
}

/* ---------------------- Event Listeners ---------------------- */
function setupEventListeners() {
  // Navigation: Change section
  const navItems = document.querySelectorAll('.sidebar nav li');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      changeSection(this.getAttribute('data-section'));
    });
  });

  // Global search
  const searchButton = document.getElementById('search-button');
  if (searchButton) searchButton.addEventListener('click', handleGlobalSearch);
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      this.checked ? enableDarkMode() : disableDarkMode();
    });
  }
  
  // Temperature unit change
  const tempUnitInputs = document.querySelectorAll('input[name="temp-unit"]');
  tempUnitInputs.forEach(input => {
    input.addEventListener('change', function() {
      localStorage.setItem('tempUnit', this.value);
      refreshWeatherDisplay();
    });
  });
  
  // Notification panel
  const notificationBtn = document.getElementById('notification-btn');
  const closeNotificationsBtn = document.getElementById('close-notifications');
  const notificationPanel = document.getElementById('notification-panel');
  if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener('click', () => notificationPanel.classList.toggle('active'));
  }
  if (closeNotificationsBtn && notificationPanel) {
    closeNotificationsBtn.addEventListener('click', () => notificationPanel.classList.remove('active'));
  }
  
  // Weather: search and current location
  const getWeatherBtn = document.getElementById('get-weather');
  if (getWeatherBtn) {
    getWeatherBtn.addEventListener('click', () => {
      const loc = document.getElementById('weather-location').value;
      if (loc.trim() !== '') fetchWeatherData(loc);
    });
  }
  const useLocationBtn = document.getElementById('use-current-location');
  if (useLocationBtn) useLocationBtn.addEventListener('click', getCurrentLocationWeather);
  
  // Job search
  const searchJobsBtn = document.getElementById('search-jobs');
  if (searchJobsBtn) searchJobsBtn.addEventListener('click', handleJobSearch);
  
  // News: category buttons and search
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      categoryBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const category = this.getAttribute('data-category');
      fetchNewsByCategory(category);
    });
  });
  const newsSearchBtn = document.getElementById('news-search-btn');
  if (newsSearchBtn) newsSearchBtn.addEventListener('click', handleNewsSearch);
  
  // News pagination (dummy functions)
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  if (prevPageBtn && nextPageBtn) {
    prevPageBtn.addEventListener('click', goToPrevNewsPage);
    nextPageBtn.addEventListener('click', goToNextNewsPage);
  }
  
  // Currency: Dashboard converter
  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      const amount = document.getElementById('currency-amount').value;
      const from = document.getElementById('from-currency').value;
      const to = document.getElementById('to-currency').value;
      convertCurrency(amount, from, to, exchangeRates, 'EUR');
    });
  }
  // Currency: Full converter
  const convertCurrencyBtn = document.getElementById('convert-currency-btn');
  if (convertCurrencyBtn) {
    convertCurrencyBtn.addEventListener('click', () => {
      const amount = document.getElementById('amount').value;
      const from = document.getElementById('from-currency-full').value;
      const to = document.getElementById('to-currency-full').value;
      convertCurrencyFull(amount, from, to);
    });
  }
  // Currency: Swap button
  const swapCurrenciesBtn = document.getElementById('swap-currencies');
  if (swapCurrenciesBtn) {
    swapCurrenciesBtn.addEventListener('click', () => {
      const fromSelect = document.getElementById('from-currency-full');
      const toSelect = document.getElementById('to-currency-full');
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
    });
  }
  
  // Clear data button
  const clearDataBtn = document.getElementById('clear-data');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
        localStorage.clear();
        alert('All data has been cleared. The page will now reload.');
        location.reload();
      }
    });
  }

  // Chat input and voice input
  const chatInput = document.getElementById('chat-message');
  const sendMessageBtn = document.getElementById('send-message');
  const voiceInputBtn = document.getElementById('voice-input');

  if (chatInput && sendMessageBtn) {
    sendMessageBtn.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message) {
        handleChatMessage(message);
        chatInput.value = '';
      }
    });
  }

  if (voiceInputBtn) {
    voiceInputBtn.addEventListener('click', () => {
      voiceAssistant.start();
    });
  }
}

/* ---------------------- Section Loading ---------------------- */
function changeSection(sectionId) {
  // Update navigation
  const navItems = document.querySelectorAll('.sidebar nav li');
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
  });
  
  // Show/hide content sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.add('active');
      loadSectionData(sectionId);
    } else {
      section.classList.remove('active');
    }
  });
}

function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'AI Dashboard':
    case 'dashboard':
      loadDashboardData();
      break;
    case 'weather':
      getCurrentLocationWeather();
      break;
    case 'jobs':
      loadSampleJobs();
      break;
    case 'news':
      fetchNewsByCategory('general');
      break;
    case 'currency':
      loadCurrencyData();
      break;
  }
}

/* ---------------------- Dashboard Data Load ---------------------- */
function loadDashboardData() {
  getCurrentLocationWeather();
  loadSampleJobs();
  loadSampleNews();
  loadSampleCurrencyData();
}

/* ---------------------- Theme Functions ---------------------- */
function toggleTheme() {
  document.body.classList.contains('dark-theme') ? disableDarkMode() : enableDarkMode();
}

function enableDarkMode() {
  document.body.classList.add('dark-theme');
  document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
  localStorage.setItem('theme', 'dark');
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) toggle.checked = true;
  updateChartTheme('dark');
}

function disableDarkMode() {
  document.body.classList.remove('dark-theme');
  document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', 'light');
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) toggle.checked = false;
  updateChartTheme('light');
}

/* ---------------------- Global Search ---------------------- */
function handleGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  const query = searchInput.value.trim();
  if (!query) return;
  
  createNotification('Processing your request', `Searching for information about: "${query}"`, true);
  setTimeout(() => {
    let section;
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('weather')) section = 'weather';
    else if (lowerQuery.includes('job') || lowerQuery.includes('work')) section = 'jobs';
    else if (lowerQuery.includes('news') || lowerQuery.includes('article')) section = 'news';
    else if (lowerQuery.includes('currency') || lowerQuery.includes('exchange') || lowerQuery.includes('convert')) section = 'currency';
    else {
      createNotification('AI Assistant', 'I found some information that might help. Would you like me to elaborate?', true);
      return;
    }
    changeSection(section);
    searchInput.value = '';
  }, 1500);
}

/* ---------------------- Notification ---------------------- */
function createNotification(title, message, unread = false) {
  const notificationList = document.querySelector('.notification-list');
  const emptyNote = document.querySelector('.empty-notifications');
  if (emptyNote) emptyNote.remove();
  
  const note = document.createElement('div');
  note.className = `notification-item${unread ? ' unread' : ''}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  note.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
    <div class="notification-time">${timeStr}</div>
  `;
  notificationList.prepend(note);
  document.getElementById('notification-btn').innerHTML = '<i class="fas fa-bell"></i> <span class="badge">!</span>';
}

/* ---------------------- Weather Functions ---------------------- */
function getCurrentLocationWeather() {
  updateWeatherUI('loading');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      err => {
        console.error('Error getting location:', err);
        updateWeatherUI('error', 'Unable to get your location. Please enter a location manually.');
        fetchWeatherData('auto:ip');
      }
    );
  } else {
    updateWeatherUI('error', 'Geolocation is not supported by your browser. Please enter a location manually.');
    fetchWeatherData('auto:ip');
  }
}

function fetchWeatherByCoords(lat, lon) {
  fetch(`/api/weather?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => updateWeatherUI('success', data))
    .catch(err => {
      console.error('Error fetching weather:', err);
      updateWeatherUI('error', { message: 'Failed to fetch weather data' });
    });
}

function fetchWeatherData(location) {
  fetch(`/api/weather?location=${encodeURIComponent(location)}`)
    .then(res => res.json())
    .then(data => updateWeatherUI('success', data))
    .catch(err => {
      console.error('Error fetching weather:', err);
      updateWeatherUI('error', { message: 'Failed to fetch weather data' });
    });
}

/**
 * Update the weather UI.
 * This function supports both the dashboard (IDs: weather-loading, weather-data, weather-error)
 * and the sub section version (using weather-location-display, weather-temperature, etc.)
 */
function updateWeatherUI(status, data) {
  // Dashboard elements
  const loadDash = document.getElementById('weather-loading');
  const dataDash = document.getElementById('weather-data');
  const errorDash = document.getElementById('weather-error');
  // Sub section elements (if present)
  const locDisplay = document.getElementById('weather-location-display');
  const tempDisplay = document.getElementById('weather-temperature');
  const condDisplay = document.getElementById('weather-condition');
  const detailsDisplay = document.getElementById('weather-details');
  
  // Hide all first
  [loadDash, dataDash, errorDash].forEach(el => el && el.classList.add('hidden'));
  
  if (status === 'loading') {
    if (loadDash) loadDash.classList.remove('hidden');
  } else if (status === 'error') {
    if (errorDash) {
      errorDash.classList.remove('hidden');
      errorDash.textContent = data.message || 'Failed to fetch weather data';
    }
    if (detailsDisplay) detailsDisplay.textContent = '';
  } else if (status === 'success') {
    if (dataDash) dataDash.classList.remove('hidden');
    // Update both dashboard and sub section if available
    renderWeatherData(data);
  }
}

function renderWeatherData(data) {
  const locationEl = document.getElementById('weather-location') || document.getElementById('weather-location-display');
  const tempEl = document.getElementById('weather-temperature');
  const condEl = document.getElementById('weather-condition');
  const iconEl = document.getElementById('weather-icon');
  const detailsEl = document.getElementById('weather-details');
  
  if (locationEl) locationEl.textContent = `${data.location.name}, ${data.location.country}`;
  if (tempEl) tempEl.textContent = `${Math.round(data.current.temp_c)}°C`;
  if (condEl) condEl.textContent = data.current.condition.text;
  if (iconEl) iconEl.src = data.current.condition.icon;
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div class="detail">
        <span class="detail-label">Feels Like</span>
        <span class="detail-value">${Math.round(data.current.feelslike_c)}°C</span>
      </div>
      <div class="detail">
        <span class="detail-label">Humidity</span>
        <span class="detail-value">${data.current.humidity}%</span>
      </div>
      <div class="detail">
        <span class="detail-label">Wind</span>
        <span class="detail-value">${data.current.wind_kph} km/h</span>
      </div>
      <div class="detail">
        <span class="detail-label">UV Index</span>
        <span class="detail-value">${data.current.uv}</span>
      </div>
    `;
  }
}

/* ---------------------- Job Search Functions ---------------------- */
function handleJobSearch() {
  const keywords = document.getElementById('job-keywords').value.trim();
  const location = document.getElementById('job-location').value.trim();
  searchJobs(keywords, location);
}

function searchJobs(keywords, location) {
  console.log('Searching jobs for:', keywords, location);
  const loadEl = document.getElementById('jobs-loading');
  const resultsEl = document.getElementById('jobs-results');
  const errorEl = document.getElementById('jobs-error');
  
  if (loadEl) loadEl.classList.remove('hidden');
  if (resultsEl) resultsEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');
  
  const params = new URLSearchParams();
  if (keywords) params.append('keywords', keywords);
  if (location) params.append('location', location);
  
  fetch(`/api/jobs?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      if (loadEl) loadEl.classList.add('hidden');
      if (data.error) {
        if (errorEl) {
          errorEl.textContent = data.error;
          errorEl.classList.remove('hidden');
        }
      } else {
        renderJobResults(data.jobs);
        if (resultsEl) resultsEl.classList.remove('hidden');
      }
    })
    .catch(err => {
      console.error('Error fetching jobs:', err);
      if (loadEl) loadEl.classList.add('hidden');
      if (errorEl) {
        errorEl.textContent = 'Failed to fetch job listings. Please try again.';
        errorEl.classList.remove('hidden');
      }
    });
}

function renderJobResults(jobs) {
  console.log('Rendering jobs:', jobs);
  const jobsList = document.getElementById('jobs-list');
  if (!jobsList) return;
  jobsList.innerHTML = '';
  if (jobs.length === 0) {
    jobsList.innerHTML = '<p class="text-center">No jobs found matching your criteria. Try different keywords or location.</p>';
    return;
  }
  jobs.forEach(job => {
    const jobEl = document.createElement('div');
    jobEl.className = 'job-item';
    jobEl.innerHTML = `
      <h3 class="job-title">${job.title}</h3>
      <div class="job-company">${job.company}</div>
      <div class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
      <div class="job-description">${job.description}</div>
      <div class="job-details">
        <span class="job-salary">${job.salary || 'Salary not specified'}</span>
        <span class="job-type">${job.type || 'Full-time'}</span>
      </div>
      <a href="${job.url}" target="_blank" class="job-apply-btn">Apply Now</a>
    `;
    jobsList.appendChild(jobEl);
  });
}

/* ---------------------- News Functions ---------------------- */
function fetchNews(category = 'general') {
  const loadEl = document.getElementById('news-loading');
  const resultsEl = document.getElementById('news-results');
  const errorEl = document.getElementById('news-error');
  
  if (loadEl) loadEl.classList.remove('hidden');
  if (resultsEl) resultsEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');
  
  fetch(`/api/news?category=${category}`)
    .then(res => res.json())
    .then(data => {
      if (loadEl) loadEl.classList.add('hidden');
      if (data.error) {
        if (errorEl) {
          errorEl.textContent = data.error;
          errorEl.classList.remove('hidden');
        }
      } else {
        renderNewsArticles(data.articles);
        if (resultsEl) resultsEl.classList.remove('hidden');
      }
    })
    .catch(err => {
      console.error('Error fetching news:', err);
      if (loadEl) loadEl.classList.add('hidden');
      if (errorEl) {
        errorEl.textContent = 'Failed to fetch news articles. Please try again.';
        errorEl.classList.remove('hidden');
      }
    });
}

// Wrapper so that category buttons can call fetchNewsByCategory
function fetchNewsByCategory(category) {
  fetchNews(category);
}

function renderNewsArticles(articles) {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;
  newsList.innerHTML = '';
  if (articles.length === 0) {
    newsList.innerHTML = '<p class="text-center">No news articles found.</p>';
    return;
  }
  articles.forEach(article => {
    const articleEl = document.createElement('div');
    articleEl.className = 'news-item';
    articleEl.innerHTML = `
      <div class="news-image">
        <img src="${article.urlToImage || '/img/news-placeholder.jpg'}" alt="${article.title}">
      </div>
      <div class="news-content">
        <h3 class="news-title">${article.title}</h3>
        <div class="news-source">${article.source.name} • ${formatDate(new Date(article.publishedAt))}</div>
        <p class="news-description">${article.description || ''}</p>
        <a href="${article.url}" target="_blank" class="news-read-more">Read Full Article</a>
      </div>
    `;
    newsList.appendChild(articleEl);
  });
}

function formatDate(date) {
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  else if (diffDays === 1) return 'Yesterday';
  else if (diffDays < 7) return `${diffDays} days ago`;
  else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function handleNewsSearch() {
  const query = document.getElementById('news-search-input').value.trim();
  if (!query) return;
  // For demonstration, using query as category; for free-form searches, consider using a different endpoint.
  fetchNews(query);
}

function goToPrevNewsPage() {
  console.log("Go to previous news page (not implemented)");
}

function goToNextNewsPage() {
  console.log("Go to next news page (not implemented)");
}

/* ---------------------- Currency Functions ---------------------- */
let exchangeRates = {};

function fetchExchangeRates() {
  const loadEl = document.getElementById('currency-loading');
  const converterEl = document.getElementById('currency-converter');
  const errorEl = document.getElementById('currency-error');
  
  if (loadEl) loadEl.classList.remove('hidden');
  if (converterEl) converterEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');
  
  fetch('/api/currency')
    .then(res => res.json())
    .then(data => {
      if (loadEl) loadEl.classList.add('hidden');
      if (data.error) {
        if (errorEl) {
          errorEl.textContent = data.error;
          errorEl.classList.remove('hidden');
        }
      } else {
        exchangeRates = data.rates;
        setupCurrencyConverter(data.rates, data.base);
        if (converterEl) converterEl.classList.remove('hidden');
      }
    })
    .catch(err => {
      console.error('Error fetching exchange rates:', err);
      if (loadEl) loadEl.classList.add('hidden');
      if (errorEl) {
        errorEl.textContent = 'Failed to fetch exchange rates. Please try again.';
        errorEl.classList.remove('hidden');
      }
    });
}

function setupCurrencyConverter(rates, base) {
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  
  fromCurrency.innerHTML = '';
  toCurrency.innerHTML = '';
  
  const currencies = Object.keys(rates).sort();
  currencies.forEach(currency => {
    const optFrom = document.createElement('option');
    optFrom.value = currency;
    optFrom.textContent = currency;
    if (currency === base) optFrom.selected = true;
    fromCurrency.appendChild(optFrom);
    
    const optTo = document.createElement('option');
    optTo.value = currency;
    optTo.textContent = currency;
    if (currency === 'USD' && base !== 'USD') optTo.selected = true;
    toCurrency.appendChild(optTo);
  });
  
  const amountInput = document.getElementById('currency-amount');
  const convertBtn = document.getElementById('convert-currency-btn');
  const resultEl = document.getElementById('conversion-result');
  
  convertBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;
    if (isNaN(amount) || amount <= 0) {
      resultEl.textContent = 'Please enter a valid amount';
      return;
    }
    const converted = convertCurrency(amount, from, to, rates, base);
    resultEl.textContent = `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
  });
  
  // Initial conversion
  const initialAmount = 1;
  amountInput.value = initialAmount;
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const converted = convertCurrency(initialAmount, from, to, rates, base);
  resultEl.textContent = `${initialAmount} ${from} = ${converted.toFixed(2)} ${to}`;
}

function convertCurrency(amount, from, to, rates, base) {
  if (from === base) return amount * rates[to];
  else if (to === base) return amount / rates[from];
  else return (amount / rates[from]) * rates[to];
}

function convertCurrencyFull(amount, fromCurr, toCurr) {
  const result = convertCurrency(parseFloat(amount), fromCurr, toCurr, exchangeRates, 'EUR');
  const resultEl = document.querySelector('.conversion-result-full .result-amount');
  if (resultEl) resultEl.textContent = result.toFixed(2);
  console.log(`${amount} ${fromCurr} = ${result.toFixed(2)} ${toCurr}`);
}

/* ---------------------- Dashboard Sample Data ---------------------- */
function loadSampleJobs() {
  searchJobs('Developer', 'New York');
}

function loadSampleNews() {
  fetchNews('general');
}

function loadSampleCurrencyData() {
  fetchExchangeRates();
}

/* ---------------------- Section Data Load Helpers ---------------------- */
function loadCurrencyData() {
  fetchExchangeRates();
}

/* ---------------------- Dummy/Placeholder Functions ---------------------- */
function initExchangeRateChart() {
  console.log('Chart initialization is not implemented.');
}

function updateChartTheme(theme) {
  console.log('Chart theme updated to:', theme);
}

function refreshWeatherDisplay() {
  const locInput = document.getElementById('weather-location');
  if (locInput && locInput.value.trim()) fetchWeatherData(locInput.value.trim());
  else getCurrentLocationWeather();
}

function initializeCharts() {
  const chartCanvas = document.getElementById('exchange-rate-chart');
  if (!chartCanvas) return;
  
  const ctx = chartCanvas.getContext('2d');
  // ...rest of chart initialization
}

// Add to app.js
class Storage {
  static async init() {
    const request = indexedDB.open('aiAssistant', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('settings', { keyPath: 'id' });
      db.createObjectStore('searchHistory', { keyPath: 'timestamp' });
    };
  }

  static async saveSettings(settings) {
    const db = await this.getDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    await store.put(settings);
  }
}

class RealtimeUpdates {
  constructor() {
    this.ws = new WebSocket(`ws://${window.location.host}`);
    this.setupListeners();
  }

  setupListeners() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch(data.type) {
        case 'weather':
          updateWeatherUI('success', data.payload);
          break;
        case 'news':
          renderNewsArticles(data.payload);
          break;
      }
    };
  }
}
class VoiceAssistant {
  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
  }

  start() {
    this.recognition.start();
    this.recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      this.processCommand(command);
    };
  }

  processCommand(command) {
    if(command.includes('weather')) {
      getCurrentLocationWeather();
    } else if(command.includes('news')) {
      fetchNews('general');
    }
    // Add more voice commands
  }
}

// Initialize voice assistant
const voiceAssistant = new VoiceAssistant();

/* ---------------------- User Profile Functions ---------------------- */
class UserProfile {
  constructor() {
    this.modal = document.getElementById('profile-modal');
    this.avatar = document.getElementById('avatar-image');
    this.nameInput = document.getElementById('display-name');
    this.emailInput = document.getElementById('email');
    this.timeZoneSelect = document.getElementById('time-zone');
    this.password=document.getElementById('password');
    this.setupListeners();
    this.loadProfile();
  }

  setupListeners() {
    // Avatar upload
    document.getElementById('avatar-upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.avatar.src = e.target.result;
          localStorage.setItem('userAvatar', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });

    // Save profile
    document.getElementById('save-profile').addEventListener('click', () => {
      this.saveProfile();
    });

    // Open profile modal when clicking avatar
    document.querySelector('.user-profile').addEventListener('click', () => {
      this.openModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.modal.style.display = 'block';
  }

  closeModal() {
    this.modal.style.display = 'none';
  }

  loadProfile() {
    // Load saved profile data
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    this.nameInput.value = profile.name || '';
    this.emailInput.value = profile.email || '';
    this.timeZoneSelect.value = profile.timeZone || 'UTC';
    this.password.value=profile.password||'';
    
    // Load avatar
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      this.avatar.src = savedAvatar;
      document.querySelector('.user-profile .avatar img').src = savedAvatar;
    }

    // Update display name in sidebar
    if (profile.name) {
      document.querySelector('.username').textContent = profile.name;
    }
  }

  saveProfile() {
    const profile = {
      name: this.nameInput.value,
      email: this.emailInput.value,
      timeZone: this.timeZoneSelect.value,
      password: this.password.value
    };

    localStorage.setItem('userProfile', JSON.stringify(profile));
    document.querySelector('.username').textContent = profile.name || 'User';
    
    createNotification('Profile Updated', 'Your profile has been successfully updated', true);
    this.closeModal();
  }
}

// Initialize user profile
const userProfile = new UserProfile();

// Add to app.js
class RequestManager {
  static cache = new Map();
  static requestTimers = new Map();

  static async cachedFetch(url, options = {}, cacheDuration = 300000) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }

    const response = await fetch(url, options);
    const data = await response.json();
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  static throttleRequest(key, fn, delay = 1000) {
    if (this.requestTimers.has(key)) {
      clearTimeout(this.requestTimers.get(key));
    }
    
    return new Promise(resolve => {
      this.requestTimers.set(key, setTimeout(async () => {
        resolve(await fn());
      }, delay));
    });
  }
}

// Add to app.js
class Performance {
  static metrics = new Map();

  static startMeasure(name) {
    this.metrics.set(name, performance.now());
  }

  static endMeasure(name) {
    const start = this.metrics.get(name);
    if (start) {
      const duration = performance.now() - start;
      console.log(`${name} took ${duration}ms`);
      // Send to analytics
      this.trackMetric(name, duration);
    }
  }

  static trackMetric(name, value) {
    // Implement analytics tracking
  }
}

// Add to app.js
class Validator {
  static validateWeatherData(data) {
    const required = ['location', 'current'];
    return required.every(key => data && data[key]);
  }

  static validateNewsArticle(article) {
    const required = ['title', 'description', 'url'];
    return required.every(key => article && article[key]);
  }

  static sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
  }
}

// Add to app.js
const app = {
  init() {
    Performance.startMeasure('app-init');
    
    // Initialize core services
    Storage.init();
    new RealtimeUpdates();
    this.setupServiceWorker();
    
    // Setup UI
    this.setupEventListeners();
    this.loadInitialData();
    
    Performance.endMeasure('app-init');
  },

  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        ErrorBoundary.handleError(error, 'service-worker');
      }
    }
  },

  setupEventListeners() {
    // Implement debounced event listeners
    const searchInput = document.getElementById('global-search');
    searchInput?.addEventListener('input', debounce((e) => {
      const query = Validator.sanitizeInput(e.target.value);
      this.handleSearch(query);
    }, 300));
  },

  async loadInitialData() {
    try {
      Performance.startMeasure('initial-load');
      await Promise.all([
        this.loadWeather(),
        this.loadNews(),
        this.loadJobs()
      ]);
      Performance.endMeasure('initial-load');
    } catch (error) {
      ErrorBoundary.handleError(error, 'initial-load');
    }
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => app.init());

// Add to app.js
class ErrorBoundary {
  static handleError(error, component, fallback = null) {
    console.error(`Error in ${component}:`, error);
    const errorEl = document.getElementById(`${component}-error`);
    if (errorEl) {
      errorEl.textContent = fallback || 'Something went wrong. Please try again.';
      errorEl.classList.remove('hidden');
    }
    // Track errors for analytics
    this.trackError(error, component);
  }

  static trackError(error, component) {
    // Implement error tracking/analytics
  }
}

// Add this theme management code
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeIcon = this.themeToggle.querySelector('i');
    this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.init();
    this.setupListeners();
  }

  init() {
    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(this.prefersDark.matches ? 'dark' : 'light');
    }
  }

  setupListeners() {
    // Theme toggle button
    this.themeToggle.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    });

    // System theme change
    this.prefersDark.addEventListener('change', (e) => {
      this.setTheme(e.matches ? 'dark' : 'light');
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icon
    this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Update charts if they exist
    if (typeof updateChartTheme === 'function') {
      updateChartTheme(theme);
    }
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

/* ---------------------- Section Management ---------------------- */
class SectionManager {
  constructor() {
    this.sections = document.querySelectorAll('.content-section');
    this.navItems = document.querySelectorAll('.sidebar nav li');
    this.currentSection = 'dashboard';
    
    this.init();
    this.setupListeners();
  }

  init() {
    // Hide all sections except dashboard initially
    this.sections.forEach(section => {
      section.style.display = section.id === 'dashboard' ? 'block' : 'none';
      section.classList.toggle('active', section.id === 'dashboard');
    });
  }

  setupListeners() {
    // Navigation click handlers
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.getAttribute('data-section');
        if (sectionId) {
          this.switchSection(sectionId);
        }
      });
    });
  }

  async switchSection(sectionId) {
    // Validate section
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // Update navigation
    this.navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
    });

    // Hide current section
    const currentSection = document.querySelector('.content-section.active');
    if (currentSection) {
      currentSection.classList.remove('active');
      currentSection.style.opacity = '0';
      await new Promise(r => setTimeout(r, 300)); // Wait for fade out
      currentSection.style.display = 'none';
    }

    // Show new section
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    setTimeout(() => {
      targetSection.style.opacity = '1';
    }, 50);

    // Load section data
    this.loadSectionContent(sectionId);
    
    // Update current section
    this.currentSection = sectionId;
    
    // Update URL without reload
    history.pushState(null, '', `#${sectionId}`);
  }

  async loadSectionContent(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Show loading state
    section.innerHTML = '<div class="section-loading">Loading...</div>';

    try {
      switch (sectionId) {
        case 'dashboard':
          await Promise.all([
            getCurrentLocationWeather(),
            loadSampleJobs(),
            loadSampleNews(),
            loadSampleCurrencyData()
          ]);
          break;

        case 'weather':
          await getCurrentLocationWeather();
          break;

        case 'jobs':
          await searchJobs('Developer', 'New York');
          break;

        case 'news':
          await fetchNewsByCategory('general');
          break;

        case 'currency':
          await fetchExchangeRates();
          break;

        case 'settings':
          // No async loading needed for settings
          break;
      }
    } catch (error) {
      section.innerHTML = `
        <div class="section-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load content. Please try again.</p>
        </div>
      `;
    }
  }
}

// Initialize section manager
document.addEventListener('DOMContentLoaded', () => {
  const sectionManager = new SectionManager();
});

// Create a single app instance to manage all functionality
class App {
  constructor() {
    this.initialized = false;
    this.modules = {
      theme: null,
      sections: null,
      profile: null,
      voice: null,
      realtime: null
    };
    this.storage = new Storage();
  }

  async init() {
    if (this.initialized) return;
    
    try {
      Performance.startMeasure('app-init');

      // Initialize core storage
      await this.storage.init();

      // Initialize modules in correct order
      this.modules.theme = new ThemeManager();
      this.modules.sections = new SectionManager();
      this.modules.profile = new UserProfile();
      this.modules.voice = new VoiceAssistant();
      this.modules.realtime = new RealtimeUpdates();

      // Setup service worker
      await this.setupServiceWorker();

      // Setup global event listeners
      this.setupGlobalListeners();

      this.initialized = true;
      Performance.endMeasure('app-init');
    } catch (error) {
      ErrorBoundary.handleError(error, 'app-init');
    }
  }

  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        ErrorBoundary.handleError(error, 'service-worker');
      }
    }
  }

  setupGlobalListeners() {
    // Global search with debounce
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        const query = Validator.sanitizeInput(e.target.value);
        this.handleGlobalSearch(query);
      }, 300));
    }

    // Error event handling
    window.addEventListener('error', (event) => {
      ErrorBoundary.handleError(event.error, 'window');
    });

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.modules.realtime?.pause();
      } else {
        this.modules.realtime?.resume();
      }
    });
  }

  handleGlobalSearch(query) {
    if (!query) return;
    this.modules.sections?.handleSearch(query);
  }

  destroy() {
    // Cleanup resources
    Object.values(this.modules).forEach(module => {
      if (module && typeof module.destroy === 'function') {
        module.destroy();
      }
    });
    this.initialized = false;
  }
}
