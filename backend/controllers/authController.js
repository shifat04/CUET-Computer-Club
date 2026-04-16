const User = require('../models/User');
const {
    createVerificationToken,
    findVerificationToken,
    deleteVerificationTokenByUser,
} = require('../services/tokenService');
const { sendVerificationEmail } = require('../services/emailService');

const verifyEmail = async (req, res) => {
    const token = req.query.token || req.body.token;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    const verificationRecord = await findVerificationToken(token);
    if (!verificationRecord || !verificationRecord.user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    verificationRecord.user.isVerified = true;
    await verificationRecord.user.save();
    await deleteVerificationTokenByUser(verificationRecord.user._id);

    return res.status(200).json({ message: 'Email verified successfully' });
};

const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
    }

    const token = await createVerificationToken(user._id);
    user.verificationSentAt = new Date();
    await user.save();

    await sendVerificationEmail(user, token);

    return res.status(200).json({ message: 'Verification email resent successfully' });
};

module.exports = {
    verifyEmail,
    resendVerificationEmail,
};
