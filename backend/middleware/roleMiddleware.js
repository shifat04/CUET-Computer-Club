const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized, admin required' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role permissions' });
    }

    return next();
};

module.exports = { authorizeRoles };
