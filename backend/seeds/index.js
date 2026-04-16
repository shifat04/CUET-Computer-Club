const dotenv = require('dotenv');
const connectDB = require('../config/db');
const seedAdmins = require('./seedAdmins');
const seedCards = require('./seedCards');
const seedUsers = require('./seedUsers');

dotenv.config();

const environment = process.env.SEED_ENV || process.env.NODE_ENV || 'development';

const run = async () => {
    await connectDB();

    const [admins, cards, users] = await Promise.all([
        seedAdmins({ environment }),
        seedCards({ environment }),
        seedUsers({ environment }),
    ]);

    console.log(`✅ Seed complete (${environment})`);
    console.log(`Admins: ${admins.length}, Cards: ${cards.length}, Users: ${users.length}`);
    process.exit(0);
};

run().catch((error) => {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
});
