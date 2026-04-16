const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
    createVerificationToken,
    createResetToken,
    findResetToken,
    deleteResetTokenByUser,
} = require('../services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (userId) => jwt.sign({ id: userId, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeEmail = (email) => String(email || '').trim().toLowerCase();

const registerUser = async (req, res) => {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = sanitizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        studentId: studentId ? String(studentId).trim() : '',
    });

    const verifyToken = await createVerificationToken(user._id);
    user.verificationSentAt = new Date();
    await user.save();

    await sendVerificationEmail(user, verifyToken);

    return res.status(201).json({
        message: 'User registered successfully. Please verify your email before login.',
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            studentId: user.studentId,
            isVerified: user.isVerified,
        },
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: sanitizeEmail(email) });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before login' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
        message: 'Login successful',
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            studentId: user.studentId,
            isVerified: user.isVerified,
        },
    });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: sanitizeEmail(email) });
    if (user) {
        const token = await createResetToken(user._id);
        await sendPasswordResetEmail(user, token);
    }

    return res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
};

const verifyResetToken = async (req, res) => {
    const token = req.query.token || req.body.token;
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    const resetToken = await findResetToken(token);
    if (!resetToken) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    return res.status(200).json({ valid: true });
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }

    if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const resetToken = await findResetToken(token);
    if (!resetToken || !resetToken.user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    resetToken.user.password = await bcrypt.hash(password, 10);
    await resetToken.user.save();
    await deleteResetTokenByUser(resetToken.user._id);

    return res.status(200).json({ message: 'Password updated successfully' });
};

const listUsers = async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
};

const updateUserVerification = async (req, res) => {
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
        return res.status(400).json({ message: 'isVerified must be a boolean' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = isVerified;
    await user.save();

    return res.status(200).json({
        message: 'User verification status updated',
        user: {
            id: user._id,
            email: user.email,
            isVerified: user.isVerified,
        },
    });
};

module.exports = {
    registerUser,
    loginUser,
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    listUsers,
    updateUserVerification,
};
