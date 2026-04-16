jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'user-jwt-token'),
}));

jest.mock('../services/tokenService', () => ({
    createVerificationToken: jest.fn(),
    createResetToken: jest.fn(),
    findResetToken: jest.fn(),
    deleteResetTokenByUser: jest.fn(),
}));

jest.mock('../services/emailService', () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const { registerUser, loginUser } = require('../controllers/userController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

describe('User registration and verification checks', () => {
    it('registers user and sends verification email', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed-pass');
        const save = jest.fn().mockResolvedValue(undefined);
        User.create.mockResolvedValue({
            _id: 'u1',
            name: 'User',
            email: 'user@cuet.test',
            studentId: '1900',
            isVerified: false,
            verificationSentAt: null,
            save,
        });
        tokenService.createVerificationToken.mockResolvedValue('verify-token');
        emailService.sendVerificationEmail.mockResolvedValue(undefined);

        const req = {
            body: {
                name: 'User',
                email: 'user@cuet.test',
                password: 'UserPass123!',
                studentId: '1900',
            },
        };
        const res = mockRes();

        await registerUser(req, res);

        expect(tokenService.createVerificationToken).toHaveBeenCalledWith('u1');
        expect(emailService.sendVerificationEmail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('blocks login when user email is not verified', async () => {
        User.findOne.mockResolvedValue({ password: 'hashed', isVerified: false });
        bcrypt.compare.mockResolvedValue(true);

        const req = { body: { email: 'user@cuet.test', password: 'UserPass123!' } };
        const res = mockRes();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});
