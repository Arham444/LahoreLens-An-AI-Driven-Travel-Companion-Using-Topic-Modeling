const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testBackend = async () => {
    try {
        console.log('--- Testing Backend ---');

        // 1. Test Root
        console.log('\n1. Testing Root Endpoint...');
        try {
            const rootRes = await axios.get('http://localhost:5000/');
            console.log('Root Response:', rootRes.data);
        } catch (e) { console.error('Root failed:', e.message); }

        // 2. Test Signup (Will fail without DB)
        console.log('\n2. Testing Signup (Expect Failure if no DB)...');
        try {
            const uniqueUser = `testuser_${Date.now()}`;
            const signupRes = await axios.post(`${API_URL}/auth/signup`, {
                username: uniqueUser,
                email: `${uniqueUser}@example.com`,
                password: 'password123',
            });
            console.log('Signup Success:', signupRes.status === 201);
        } catch (e) {
            console.log('Signup Failed (Expected if no DB):', e.response ? e.response.data : e.message);
        }

        // 3. Test Login (Will fail without DB)
        console.log('\n3. Testing Login (Expect Failure if no DB)...');
        try {
            const uniqueUser = `testuser_${Date.now()}`; // Note: This user won't exist
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: `${uniqueUser}@example.com`,
                password: 'password123',
            });
            console.log('Login Success:', loginRes.status === 200);
        } catch (e) {
            console.log('Login Failed (Expected if no DB):', e.response ? e.response.data : e.message);
        }

        // 4. Test Recommendations (Should Work)
        console.log('\n4. Testing Recommendations (Should Work)...');
        try {
            const recRes = await axios.get(`${API_URL}/places/recommendations`);
            console.log('Recommendations Count:', recRes.data.length);
            console.log('First Recommendation:', recRes.data[0].name);
        } catch (e) { console.error('Recommendations failed:', e.message); }

        // 5. Test Search (Should Work)
        console.log('\n5. Testing Search (Should Work)...');
        try {
            const searchRes = await axios.get(`${API_URL}/places/search?q=mosque`);
            console.log('Search Results for "mosque":', searchRes.data.length);
        } catch (e) { console.error('Search failed:', e.message); }

        console.log('\n--- Verification Complete ---');
    } catch (error) {
        console.error('Fatal Error:', error.message);
    }
};

testBackend();
