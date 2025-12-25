// @desc    Get current weather for Lahore
// @route   GET /api/weather
// @access  Public
const getWeather = async (req, res) => {
    // MOCKED DATA - In a real app, use OpenWeatherMap API
    // Returning 28°C Partly Cloudy as seen in the screenshot
    res.json({
        location: 'Lahore',
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 45,
        windSpeed: 10,
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    });
};

module.exports = {
    getWeather,
};
