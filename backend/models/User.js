const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        studentId: {
            type: String,
            trim: true,
            default: '',
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationSentAt: {
            type: Date,
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
