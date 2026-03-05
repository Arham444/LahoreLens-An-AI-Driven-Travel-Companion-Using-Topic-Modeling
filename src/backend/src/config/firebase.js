const admin = require('firebase-admin');
const serviceAccount = require('../../config/firebaseServiceAccount.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
    console.error('Firebase Admin SDK initialization error:', error.message);
}

module.exports = admin;
