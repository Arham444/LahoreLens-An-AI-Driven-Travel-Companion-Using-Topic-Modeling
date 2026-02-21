const axios = require('axios');

// @desc    Get current weather for Lahore
// @route   GET /api/weather
// @access  Public
const getWeather = async (req, res) => {
    try {
        // Lahore coordinates
        const lat = 31.5204;
        const lon = 74.3587;

        // Fetch from free Open-Meteo API
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);

        const current = response.data.current_weather;

        // Map WMO weather codes to string conditions (Basic mapping)
        const getCondition = (code) => {
            if (code === 0) return 'Clear Sky';
            if (code >= 1 && code <= 3) return 'Partly Cloudy';
            if (code >= 45 && code <= 48) return 'Foggy';
            if (code >= 51 && code <= 67) return 'Rain';
            if (code >= 71 && code <= 77) return 'Snow';
            if (code >= 95) return 'Thunderstorm';
            return 'Unknown';
        };

        // AI Travel Warning Logic based on temperature
        const temp = current.temperature;
        let warning = null;

        if (temp >= 40) {
            warning = "Extreme Heat Alert: It is dangerously hot in Lahore today. Hydrate and avoid outdoor activities between 12 PM - 4 PM.";
        } else if (temp >= 35) {
            warning = "Heat Warning: Very warm weather. Perfect for indoor cultural sites, but stay hydrated if outdoors.";
        } else if (temp <= 5) {
            warning = "Cold Warning: Bundle up! Temperatures are freezing in Lahore.";
        } else if (temp >= 15 && temp <= 25) {
            warning = "Perfect Weather: IDEAL conditions for exploring food streets and the Badshahi Mosque today!";
        }

        res.json({
            location: 'Lahore',
            temperature: temp,
            condition: getCondition(current.weathercode),
            windSpeed: current.windspeed,
            warning: warning, // New AI Warning Field
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        });
    } catch (error) {
        console.error("Weather API Error:", error.message);
        // Fallback data in case API fails
        res.status(500).json({
            location: 'Lahore',
            temperature: 28,
            condition: 'Partly Cloudy (Fallback)',
            windSpeed: 10,
            warning: null,
            date: new Date().toLocaleDateString('en-US'),
            error: 'Failed to fetch live weather'
        });
    }
};

module.exports = {
    getWeather,
};
