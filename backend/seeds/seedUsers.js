const bcrypt = require('bcryptjs');
const User = require('../models/User');

const devUsers = [
    {
        name: 'Test User One',
        email: 'user1@cuetcc.dev',
        studentId: '1900001',
        password: 'UserPass123!',
        isVerified: true,
    },
    {
        name: 'Test User Two',
        email: 'user2@cuetcc.dev',
        studentId: '1900002',
        password: 'UserPass123!',
        isVerified: false,
    },
];

const prodUsers = [];

const seedUsers = async ({ environment = 'development' } = {}) => {
    const base = environment === 'production' ? prodUsers : devUsers;

    await User.deleteMany({});

    const payload = await Promise.all(
        base.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 10),
        }))
    );

    return User.insertMany(payload);
};

module.exports = seedUsers;
