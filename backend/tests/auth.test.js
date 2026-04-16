jest.mock('../models/User', () => ({
    findOne: jest.fn(),
}));

jest.mock('../services/tokenService', () => ({
    createVerificationToken: jest.fn(),
    findVerificationToken: jest.fn(),
    deleteVerificationTokenByUser: jest.fn(),
    createResetToken: jest.fn(),
    findResetToken: jest.fn(),
    deleteResetTokenByUser: jest.fn(),
}));

jest.mock('../services/emailService', () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
}));

const User = require('../models/User');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');
const { verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { requestPasswordReset, verifyResetToken, resetPassword } = require('../controllers/userController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

describe('Email verification and password reset flow', () => {
    it('verifies email token and marks user as verified', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        tokenService.findVerificationToken.mockResolvedValue({ user: { _id: 'u1', isVerified: false, save } });

        const req = { body: { token: 'verify-token' }, query: {} };
        const res = mockRes();
        await verifyEmail(req, res);

        expect(tokenService.deleteVerificationTokenByUser).toHaveBeenCalledWith('u1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('resends verification email for unverified user', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        User.findOne.mockResolvedValue({ _id: 'u2', email: 'user@cuet.test', name: 'User', isVerified: false, save });
        tokenService.createVerificationToken.mockResolvedValue('new-token');

        const req = { body: { email: 'user@cuet.test' } };
        const res = mockRes();
        await resendVerificationEmail(req, res);

        expect(emailService.sendVerificationEmail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('handles password reset request, verify and reset', async () => {
        User.findOne.mockResolvedValue({ _id: 'u3', name: 'User', email: 'user@cuet.test' });
        tokenService.createResetToken.mockResolvedValue('reset-token');

        const requestRes = mockRes();
        await requestPasswordReset({ body: { email: 'user@cuet.test' } }, requestRes);
        expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();

        tokenService.findResetToken.mockResolvedValue({ user: { _id: 'u3', save: jest.fn().mockResolvedValue(undefined) } });

        const verifyRes = mockRes();
        await verifyResetToken({ query: { token: 'reset-token' }, body: {} }, verifyRes);
        expect(verifyRes.status).toHaveBeenCalledWith(200);

        bcrypt.hash.mockResolvedValue('new-hash');
        const resetRes = mockRes();
        await resetPassword({ body: { token: 'reset-token', password: 'NewPass123!' } }, resetRes);
        expect(tokenService.deleteResetTokenByUser).toHaveBeenCalledWith('u3');
        expect(resetRes.status).toHaveBeenCalledWith(200);
    });
});
