const express = require('express');
const { registerAdmin, loginAdmin, verifyAdmin } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/verify', protectAdmin, verifyAdmin);

module.exports = router;
