const express = require('express');
const {
    registerAdmin,
    loginAdmin,
    verifyAdmin,
    listAdmins,
    updateAdminRole,
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/verify', protectAdmin, verifyAdmin);
router.get('/users', protectAdmin, authorizeRoles('super_admin'), listAdmins);
router.patch('/users/:id/role', protectAdmin, authorizeRoles('super_admin'), updateAdminRole);

module.exports = router;
