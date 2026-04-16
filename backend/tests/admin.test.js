jest.mock('../models/Admin', () => ({
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'admin-jwt-token'),
}));

const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { registerAdmin, loginAdmin } = require('../controllers/adminController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

describe('Admin authentication flows', () => {
    it('registers first admin as super_admin', async () => {
        Admin.findOne.mockResolvedValue(null);
        Admin.countDocuments.mockResolvedValue(0);
        bcrypt.hash.mockResolvedValue('hashed');
        Admin.create.mockResolvedValue({
            _id: 'a1',
            name: 'Root',
            email: 'root@cuet.test',
            role: 'super_admin',
        });

        const req = { body: { name: 'Root', email: 'root@cuet.test', password: 'StrongPass123!' } };
        const res = mockRes();

        await registerAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ admin: expect.objectContaining({ role: 'super_admin' }) })
        );
    });

    it('logs in existing admin with valid credentials', async () => {
        Admin.findOne.mockResolvedValue({
            _id: 'a2',
            name: 'Editor',
            email: 'editor@cuet.test',
            password: 'hashed',
            role: 'editor',
        });
        bcrypt.compare.mockResolvedValue(true);

        const req = { body: { email: 'editor@cuet.test', password: 'StrongPass123!' } };
        const res = mockRes();

        await loginAdmin(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                token: 'admin-jwt-token',
                admin: expect.objectContaining({ role: 'editor' }),
            })
        );
    });
});
