const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (adminId) => jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
    });

    return res.status(201).json({
        message: 'Admin registered successfully',
        token: generateToken(admin._id),
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
        },
    });
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
        message: 'Login successful',
        token: generateToken(admin._id),
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
        },
    });
};

const verifyAdmin = async (req, res) => {
    return res.status(200).json({
        valid: true,
        admin: req.admin,
    });
};

module.exports = {
    registerAdmin,
    loginAdmin,
    verifyAdmin,
};
