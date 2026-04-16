const express = require('express');
const {
    registerUser,
    loginUser,
    listUsers,
    updateUserVerification,
} = require('../controllers/userController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protectAdmin, authorizeRoles('super_admin', 'editor'), listUsers);
router.patch('/:id/verify', protectAdmin, authorizeRoles('super_admin'), updateUserVerification);

module.exports = router;
