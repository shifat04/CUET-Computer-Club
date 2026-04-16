jest.mock('../services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');
const emailService = require('../services/emailService');

describe('Auth verification and password reset flow', () => {
    it('verifies email and resets password using issued tokens', async () => {
        await request(app).post('/api/users/register').send({
            name: 'User Two',
            email: 'user2@cuet.test',
            password: 'UserPass123!',
        });

        const firstVerificationToken = emailService.sendVerificationEmail.mock.calls[0][1];

        const verify = await request(app).post('/api/auth/verify-email').send({ token: firstVerificationToken });
        expect(verify.status).toBe(200);

        const login = await request(app).post('/api/users/login').send({
            email: 'user2@cuet.test',
            password: 'UserPass123!',
        });
        expect(login.status).toBe(200);

        const resetRequest = await request(app).post('/api/auth/password-reset/request').send({
            email: 'user2@cuet.test',
        });
        expect(resetRequest.status).toBe(200);

        const resetToken = emailService.sendPasswordResetEmail.mock.calls[0][1];

        const verifyReset = await request(app).get(`/api/auth/password-reset/verify?token=${resetToken}`);
        expect(verifyReset.status).toBe(200);

        const reset = await request(app).post('/api/auth/password-reset/reset').send({
            token: resetToken,
            password: 'NewPass456!',
        });
        expect(reset.status).toBe(200);

        const relogin = await request(app).post('/api/users/login').send({
            email: 'user2@cuet.test',
            password: 'NewPass456!',
        });
        expect(relogin.status).toBe(200);
    });
});
