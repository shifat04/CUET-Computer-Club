jest.mock('../services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');

const registerAdmin = async ({ email, role }) => {
    const base = await request(app).post('/api/admin/register').send({
        name: 'Seed Root',
        email: 'seed-root@cuet.test',
        password: 'StrongPass123!',
    });

    const created = await request(app).post('/api/admin/register').send({
        name: role,
        email,
        password: 'StrongPass123!',
        role,
    });

    return { rootToken: base.body.token, admin: created.body.admin, token: created.body.token };
};

describe('Card CRUD with RBAC', () => {
    it('allows editor create/update and blocks viewer updates', async () => {
        const { rootToken } = await registerAdmin({ email: 'editor-role@cuet.test', role: 'editor' });

        const loginEditor = await request(app).post('/api/admin/login').send({
            email: 'editor-role@cuet.test',
            password: 'StrongPass123!',
        });

        const create = await request(app)
            .post('/api/cards')
            .set('Authorization', `Bearer ${loginEditor.body.token}`)
            .send({ title: 'Event', description: 'Desc', features: 'A,B' });

        expect(create.status).toBe(201);

        const viewer = await request(app).post('/api/admin/register').send({
            name: 'Viewer',
            email: 'viewer-role@cuet.test',
            password: 'StrongPass123!',
            role: 'viewer',
        });

        const viewerUpdate = await request(app)
            .put(`/api/cards/${create.body._id}`)
            .set('Authorization', `Bearer ${viewer.body.token}`)
            .send({ title: 'Changed' });

        expect(viewerUpdate.status).toBe(403);

        const deleteByRoot = await request(app)
            .delete(`/api/cards/${create.body._id}`)
            .set('Authorization', `Bearer ${rootToken}`);

        expect(deleteByRoot.status).toBe(200);
    });
});
