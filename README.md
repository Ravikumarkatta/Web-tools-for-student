# Web Tools for Student

## Overview
This project is an AI-powered dashboard that integrates weather reporting, news, job search, currency conversion, and advanced AI features like predictive analysis, voice control, and personalized experiences.

## Features
- **Weather Reporting**: Get real-time weather updates for any location.
- **News Aggregator**: Stay updated with the latest news from multiple sources.
- **Job Search**: Search for jobs based on location, skills, and preferences.
- **Currency Conversion**: Convert currencies with real-time exchange rates.
- **AI Features**:
  - Predictive Analysis: Analyze trends and provide insights.
  - Voice Control: Interact with the dashboard using voice commands.
  - Personalized Experiences: Tailored recommendations based on user preferences.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Ravikumarkatta/web-tools-for-student.git
   ```
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your API keys.
4. Start the server with `npm start`.
5. Open `public/index.html` in your browser.

## Running the Application with Docker

To run the application using Docker, follow these steps:

1. **Build the Docker Image**:
   ```bash
   docker-compose build
   ```

2. **Run the Application**:
   ```bash
   docker-compose up
   ```

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.

4. **Stop the Application**:
   To stop the application, press `Ctrl+C` in the terminal where Docker is running, or use:
   ```bash
   docker-compose down
   ```

## Folder Structure
- **public/**: Frontend static files.
- **src/**: Core logic (AI functionalities, external API services, chatbot).
- **backend/**: Node.js server and configuration.
- **tests/**: Unit and integration tests.
- **logs/**: Application logs.
