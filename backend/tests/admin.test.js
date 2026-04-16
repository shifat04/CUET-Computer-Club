jest.mock('../services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');

describe('Admin authentication and RBAC', () => {
    it('registers first admin as super_admin and protects role endpoint', async () => {
        const first = await request(app).post('/api/admin/register').send({
            name: 'Root',
            email: 'root@cuet.test',
            password: 'StrongPass123!',
        });

        expect(first.status).toBe(201);
        expect(first.body.admin.role).toBe('super_admin');

        const second = await request(app).post('/api/admin/register').send({
            name: 'Editor',
            email: 'editor@cuet.test',
            password: 'StrongPass123!',
            role: 'editor',
        });

        expect(second.status).toBe(201);

        const roleUpdate = await request(app)
            .patch(`/api/admin/users/${second.body.admin.id}/role`)
            .set('Authorization', `Bearer ${first.body.token}`)
            .send({ role: 'viewer' });

        expect(roleUpdate.status).toBe(200);
        expect(roleUpdate.body.admin.role).toBe('viewer');
    });
});
