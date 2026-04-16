const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
    {
        icon: {
            type: String,
            default: '💻',
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        features: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Card', cardSchema);
