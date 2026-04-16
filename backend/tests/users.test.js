jest.mock('../services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');

describe('User registration and verification guards', () => {
    it('registers user, creates verification token and blocks login before verification', async () => {
        const register = await request(app).post('/api/users/register').send({
            name: 'User One',
            email: 'user1@cuet.test',
            password: 'UserPass123!',
            studentId: '1900123',
        });

        expect(register.status).toBe(201);
        expect(register.body.user.isVerified).toBe(false);

        const user = await User.findOne({ email: 'user1@cuet.test' });
        const token = await VerificationToken.findOne({ user: user._id });

        expect(token).toBeTruthy();

        const login = await request(app).post('/api/users/login').send({
            email: 'user1@cuet.test',
            password: 'UserPass123!',
        });

        expect(login.status).toBe(403);
    });
});
