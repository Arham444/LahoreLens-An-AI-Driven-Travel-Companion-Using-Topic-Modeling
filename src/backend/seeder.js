const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const colors = require('colors');
const Place = require('./src/models/Place');
const Event = require('./src/models/Event');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

/**
 * Parse the raw 'comment' field from the CSV.
 * The CSV has columns: comment, mood, topic_id, topic_name
 * But the 'comment' column contains tab-separated subfields:
 *   Source\tContext_Title\tUser\tComment\tLikes\tURL
 */
function parseCommentField(rawComment) {
    if (!rawComment) return null;

    const parts = rawComment.split('\t');
    if (parts.length >= 6) {
        return {
            source: parts[0]?.trim() || '',
            contextTitle: parts[1]?.trim() || '',
            originalUser: parts[2]?.trim() || '',
            comment: parts[3]?.trim() || '',
            likes: parts[4]?.trim() || '',
            sourceUrl: parts[5]?.trim() || '',
        };
    }

    // If not tab-separated, treat entire string as the comment
    return {
        source: 'Unknown',
        contextTitle: '',
        originalUser: '',
        comment: rawComment.trim(),
        likes: '',
        sourceUrl: '',
    };
}

/**
 * Extract a place/location name from the comment and context title.
 * Uses simple heuristics to find named locations.
 */
function extractName(parsed) {
    // Use context title as the name (it's usually the thread topic)
    if (parsed.contextTitle && parsed.contextTitle !== 'Context_Title') {
        return parsed.contextTitle.substring(0, 100);
    }
    // Fallback: first 60 chars of comment
    return parsed.comment.substring(0, 60) + '...';
}

/**
 * Map topic names to categories for the frontend
 */
function mapTopicToCategory(topicName) {
    const mapping = {
        'Food & Dining': 'Food',
        'Social/Personal': 'Culture',
        'General/Lifestyle': 'Lifestyle',
    };
    return mapping[topicName] || 'General';
}

const importData = async () => {
    try {
        console.log('Clearing existing data...'.yellow);
        await Place.deleteMany();
        await Event.deleteMany();

        const csvPath = __dirname + '/../ai_models/LAHORE_LENS_MASTER_API_READY.csv';

        if (!fs.existsSync(csvPath)) {
            console.error(`CSV file not found at: ${csvPath}`.red);
            process.exit(1);
        }

        console.log('Reading CSV file...'.cyan);

        const records = [];
        let skippedHeader = false;

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row) => {
                    // Skip the malformed first row (it contains column headers as data)
                    if (!skippedHeader && row.comment && row.comment.includes('Context_Title')) {
                        skippedHeader = true;
                        return;
                    }

                    const parsed = parseCommentField(row.comment);
                    if (!parsed || !parsed.comment || parsed.comment.length < 5) return;

                    records.push({
                        name: extractName(parsed),
                        description: parsed.comment.substring(0, 500),
                        category: mapTopicToCategory(row.topic_name),
                        mood: row.mood || 'Neutral',
                        topicId: parseInt(row.topic_id) || 0,
                        topicName: row.topic_name || 'General/Lifestyle',
                        source: parsed.source,
                        sourceUrl: parsed.sourceUrl,
                        originalUser: parsed.originalUser,
                        likes: parsed.likes,
                        comment: parsed.comment,
                        sentimentScore: row.mood === 'Positive' ? 4.5 : row.mood === 'Negative' ? 2.0 : 3.0,
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`Parsed ${records.length} valid records from CSV`.cyan);

        // Bulk insert in batches of 1000
        const batchSize = 1000;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await Place.insertMany(batch, { ordered: false });
            console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`.green);
        }

        // Also seed a few curated events (keep existing)
        const events = [
            {
                name: 'Basant Festival',
                date: 'March 15, 2026',
                location: 'Minar-e-Pakistan',
                description: 'The historic kite flying festival of Lahore.',
            },
            {
                name: 'Lahore Literary Festival',
                date: 'March 20-22, 2026',
                location: 'Alhamra Arts Council',
                description: 'A celebration of literature and arts.',
            },
            {
                name: 'Food Carnival',
                date: 'March 28, 2026',
                location: 'Fortress Stadium',
                description: 'Biggest food festival in town.',
            },
        ];
        await Event.insertMany(events);

        console.log(`\n✅ Data Imported Successfully!`.green.bold);
        console.log(`   Places: ${records.length}`.green);
        console.log(`   Events: ${events.length}`.green);
        process.exit();
    } catch (error) {
        console.error(`\n❌ Import Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // Destroy data
    const destroyData = async () => {
        await Place.deleteMany();
        await Event.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    };
    destroyData();
} else {
    importData();
}
