const Card = require('../models/Card');

const normalizeFeatures = (featuresInput) => {
    if (Array.isArray(featuresInput)) {
        return featuresInput.map((feature) => String(feature).trim()).filter(Boolean);
    }

    if (typeof featuresInput === 'string') {
        return featuresInput
            .split(',')
            .map((feature) => feature.trim())
            .filter(Boolean);
    }

    return [];
};

const createCard = async (req, res) => {
    const { icon, title, description, features } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    const card = await Card.create({
        icon: icon || '💻',
        title,
        description,
        features: normalizeFeatures(features),
    });

    return res.status(201).json(card);
};

const getCards = async (req, res) => {
    const cards = await Card.find().sort({ createdAt: -1 });
    return res.status(200).json(cards);
};

const updateCard = async (req, res) => {
    const { icon, title, description, features } = req.body;

    const card = await Card.findById(req.params.id);
    if (!card) {
        return res.status(404).json({ message: 'Card not found' });
    }

    if (icon !== undefined) {
        card.icon = icon;
    }

    if (title !== undefined) {
        card.title = title;
    }

    if (description !== undefined) {
        card.description = description;
    }
    if (features !== undefined) {
        card.features = normalizeFeatures(features);
    }

    const updatedCard = await card.save();
    return res.status(200).json(updatedCard);
};

const deleteCard = async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (!card) {
        return res.status(404).json({ message: 'Card not found' });
    }

    await card.deleteOne();
    return res.status(200).json({ message: 'Card deleted successfully' });
};

module.exports = {
    createCard,
    getCards,
    updateCard,
    deleteCard,
};
