const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Place = require('./src/models/Place');
const Event = require('./src/models/Event');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Place.deleteMany();
        await Event.deleteMany();

        const places = [
            {
                name: 'Badshahi Mosque',
                description: 'A historic mosque and a major landmark of Lahore, built by Emperor Aurangzeb.',
                category: 'History',
                sentimentScore: 4.9,
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Badshahi_Mosque_front_picture.jpg/800px-Badshahi_Mosque_front_picture.jpg',
            },
            {
                name: 'Food Street Fort Road',
                description: 'Famous for its traditional food and stunning view of the Badshahi Mosque.',
                category: 'Dining',
                sentimentScore: 4.8,
                imageUrl: 'https://farm8.staticflickr.com/7161/6763750865_89710f43b6_b.jpg',
            },
            {
                name: 'Lahore Fort',
                description: 'A citadel in the city of Lahore, Pakistan. A UNESCO World Heritage Site.',
                category: 'Historical',
                sentimentScore: 4.7,
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Lahore_Fort_View_from_Baradari.jpg',
            },
            {
                name: 'Anarkali Bazaar',
                description: 'One of the oldest surviving markets in South Asia, dating back at least 200 years.',
                category: 'Shopping',
                sentimentScore: 4.6,
                imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Anarkali_Bazaar_Lahore.jpg/800px-Anarkali_Bazaar_Lahore.jpg',
            },
        ];

        const events = [
            {
                name: 'Basant Festival',
                date: 'March 15, 2025',
                location: 'Minar-e-Pakistan',
                description: 'The historic kite flying festival of Lahore.',
                imageUrl: 'https://example.com/basant.jpg',
            },
            {
                name: 'Lahore Literary Festival',
                date: 'March 20-22, 2025',
                location: 'Alhamra Arts Council',
                description: 'A celebration of literature and arts.',
                imageUrl: 'https://example.com/llf.jpg',
            },
            {
                name: 'Food Carnival',
                date: 'March 28, 2025',
                location: 'Fortress Stadium',
                description: 'Biggest food festival in town.',
                imageUrl: 'https://example.com/food.jpg',
            },
        ];

        await Place.insertMany(places);
        await Event.insertMany(events);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // Add delete logic if needed
    // destroyData(); 
} else {
    importData();
}
