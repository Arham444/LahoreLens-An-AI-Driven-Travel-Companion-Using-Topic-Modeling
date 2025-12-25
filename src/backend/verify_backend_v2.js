const axios = require('axios');
const colors = require('colors');

const API_URL = 'http://localhost:5000/api';

const verify = async () => {
    console.log('--- Testing Backend (v2) ---'.yellow.bold);

    // 1. Test Root
    try {
        const res = await axios.get('http://localhost:5000/');
        console.log(`1. Root: ${'PASS'.green} - ${res.data}`);
    } catch (err) {
        console.log(`1. Root: ${'FAIL'.red} - ${err.message}`);
    }

    // 2. Test Events (NEW)
    try {
        const res = await axios.get(`${API_URL}/events`);
        console.log(`2. Events: ${'PASS'.green} - Found ${res.data.length} events`);
        if (res.data.length > 0) {
            console.log(`   Sample: ${res.data[0].name} at ${res.data[0].location}`.gray);
        }
    } catch (err) {
        console.log(`2. Events: ${'FAIL'.red} - ${err.message}`);
    }

    // 3. Test Weather (NEW)
    try {
        const res = await axios.get(`${API_URL}/weather`);
        console.log(`3. Weather: ${'PASS'.green} - ${res.data.temperature}°C in ${res.data.location}`);
    } catch (err) {
        console.log(`3. Weather: ${'FAIL'.red} - ${err.message}`);
    }

    // 4. Test Recommendations (Real Data now)
    try {
        const res = await axios.get(`${API_URL}/places/recommendations`);
        console.log(`4. Recommendations: ${'PASS'.green} - Found ${res.data.length} places`);
        if (res.data.length > 0) {
            console.log(`   Top Place: ${res.data[0].name} (Score: ${res.data[0].sentimentScore})`.gray);
        }
    } catch (err) {
        console.log(`4. Recommendations: ${'FAIL'.red} - ${err.message}`);
    }

    console.log('\n--- Verification Complete ---'.yellow.bold);
};

verify();
