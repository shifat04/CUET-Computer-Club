const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (adminId) => jwt.sign({ id: adminId, type: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isValidRole = (role) => ['super_admin', 'editor', 'viewer'].includes(role);

const registerAdmin = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingAdmin = await Admin.findOne({ email: String(email).trim().toLowerCase() });
    if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminCount = await Admin.countDocuments();
    const resolvedRole = adminCount === 0 ? 'super_admin' : isValidRole(role) ? role : 'viewer';

    const admin = await Admin.create({
        name: String(name).trim(),
        email,
        password: hashedPassword,
        role: resolvedRole,
    });

    return res.status(201).json({
        message: 'Admin registered successfully',
        token: generateToken(admin._id),
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    });
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() });
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
            role: admin.role,
        },
    });
};

const verifyAdmin = async (req, res) => {
    return res.status(200).json({
        valid: true,
        admin: req.admin,
    });
};

const listAdmins = async (req, res) => {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json(admins);
};

const updateAdminRole = async (req, res) => {
    const { role } = req.body;

    if (!isValidRole(role)) {
        return res.status(400).json({ message: 'Invalid role value' });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
    }

    admin.role = role;
    await admin.save();

    return res.status(200).json({
        message: 'Admin role updated successfully',
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    });
};

module.exports = {
    registerAdmin,
    loginAdmin,
    verifyAdmin,
    listAdmins,
    updateAdminRole,
};
