const crypto = require('crypto');
const VerificationToken = require('../models/VerificationToken');
const ResetToken = require('../models/ResetToken');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateRawToken = () => crypto.randomBytes(32).toString('hex');

const createVerificationToken = async (userId) => {
    const rawToken = generateRawToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await VerificationToken.findOneAndUpdate(
        { user: userId },
        { tokenHash: hashToken(rawToken), expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return rawToken;
};

const findVerificationToken = (rawToken) =>
    VerificationToken.findOne({
        tokenHash: hashToken(rawToken),
        expiresAt: { $gt: new Date() },
    }).populate('user');

const deleteVerificationTokenByUser = (userId) => VerificationToken.deleteOne({ user: userId });

const createResetToken = async (userId) => {
    const rawToken = generateRawToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await ResetToken.findOneAndUpdate(
        { user: userId },
        { tokenHash: hashToken(rawToken), expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return rawToken;
};

const findResetToken = (rawToken) =>
    ResetToken.findOne({
        tokenHash: hashToken(rawToken),
        expiresAt: { $gt: new Date() },
    }).populate('user');

const deleteResetTokenByUser = (userId) => ResetToken.deleteOne({ user: userId });

module.exports = {
    createVerificationToken,
    findVerificationToken,
    deleteVerificationTokenByUser,
    createResetToken,
    findResetToken,
    deleteResetTokenByUser,
};
