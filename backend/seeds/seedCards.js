const Card = require('../models/Card');

const devCards = [
    {
        icon: '💻',
        title: 'Programming Bootcamp',
        description: 'Hands-on coding workshop for beginners and intermediate learners.',
        features: ['C++', 'Problem Solving', 'Mentorship'],
    },
    {
        icon: '🤖',
        title: 'AI Study Circle',
        description: 'Weekly group session on machine learning fundamentals and projects.',
        features: ['Python', 'ML Basics', 'Team Projects'],
    },
];

const prodCards = [
    {
        icon: '🚀',
        title: 'Official Club Activities',
        description: 'Production seed card for baseline deployment verification.',
        features: ['Events', 'Workshops'],
    },
];

const seedCards = async ({ environment = 'development' } = {}) => {
    const cards = environment === 'production' ? prodCards : devCards;
    await Card.deleteMany({});
    return Card.insertMany(cards);
};

module.exports = seedCards;
