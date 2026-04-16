const express = require('express');
const { verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const {
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
} = require('../controllers/userController');

const router = express.Router();

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/password-reset/request', requestPasswordReset);
router.get('/password-reset/verify', verifyResetToken);
router.post('/password-reset/reset', resetPassword);

module.exports = router;
