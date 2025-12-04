// @desc    Get trending recommendations
// @route   GET /api/places/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
    // MOCKED DATA - To be replaced by Python Model output later
    const recommendations = [
        {
            _id: '1',
            name: 'Badshahi Mosque',
            description: 'A historic mosque and a major landmark of Lahore.',
            category: 'History',
            sentimentScore: 0.95,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Badshahi_Mosque_front_picture.jpg/1200px-Badshahi_Mosque_front_picture.jpg',
        },
        {
            _id: '2',
            name: 'Lahore Fort',
            description: 'A citadel in the city of Lahore, Pakistan.',
            category: 'History',
            sentimentScore: 0.92,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Lahore_Fort_View_from_Baradari.jpg/1200px-Lahore_Fort_View_from_Baradari.jpg',
        },
        {
            _id: '3',
            name: 'Food Street Fort Road',
            description: 'Famous for its traditional food and view of the Badshahi Mosque.',
            category: 'Food',
            sentimentScore: 0.98,
            imageUrl: 'https://i.pinimg.com/originals/a0/0c/8a/a00c8a329737527643520556b4323215.jpg',
        },
        {
            _id: '4',
            name: 'Wagah Border',
            description: 'The border crossing between Pakistan and India, famous for the daily ceremony.',
            category: 'Event',
            sentimentScore: 0.88,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Wagah_Border_Ceremony.jpg',
        },
        {
            _id: '5',
            name: 'Emporium Mall',
            description: 'One of the largest shopping malls in Pakistan.',
            category: 'Shopping',
            sentimentScore: 0.85,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Emporium_Mall_Lahore.jpg/1200px-Emporium_Mall_Lahore.jpg',
        },
    ];

    res.json(recommendations);
};

// @desc    Search places
// @route   GET /api/places/search
// @access  Public
const searchPlaces = async (req, res) => {
    const { q } = req.query;

    // MOCKED SEARCH - Just returns a filtered list from the mocked data
    // In real app, this would query MongoDB or the Python Search Engine
    const allPlaces = [
        {
            _id: '1',
            name: 'Badshahi Mosque',
            description: 'A historic mosque and a major landmark of Lahore.',
            category: 'History',
            sentimentScore: 0.95,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Badshahi_Mosque_front_picture.jpg/1200px-Badshahi_Mosque_front_picture.jpg',
        },
        {
            _id: '2',
            name: 'Lahore Fort',
            description: 'A citadel in the city of Lahore, Pakistan.',
            category: 'History',
            sentimentScore: 0.92,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Lahore_Fort_View_from_Baradari.jpg/1200px-Lahore_Fort_View_from_Baradari.jpg',
        },
        {
            _id: '3',
            name: 'Food Street Fort Road',
            description: 'Famous for its traditional food and view of the Badshahi Mosque.',
            category: 'Food',
            sentimentScore: 0.98,
            imageUrl: 'https://i.pinimg.com/originals/a0/0c/8a/a00c8a329737527643520556b4323215.jpg',
        },
    ];

    if (!q) {
        return res.json([]);
    }

    const results = allPlaces.filter(place =>
        place.name.toLowerCase().includes(q.toLowerCase()) ||
        place.category.toLowerCase().includes(q.toLowerCase())
    );

    res.json(results);
};

module.exports = {
    getRecommendations,
    searchPlaces,
};
