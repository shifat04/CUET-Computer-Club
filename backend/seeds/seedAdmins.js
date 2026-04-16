const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const devAdmins = [
    { name: 'Super Admin', email: 'superadmin@cuetcc.dev', password: 'AdminPass123!', role: 'super_admin' },
    { name: 'Content Editor', email: 'editor@cuetcc.dev', password: 'EditorPass123!', role: 'editor' },
    { name: 'Read Only Viewer', email: 'viewer@cuetcc.dev', password: 'ViewerPass123!', role: 'viewer' },
];

const prodAdmins = [
    { name: 'Production Admin', email: 'admin@cuetcc.com', password: 'ChangeThisInProduction123!', role: 'super_admin' },
];

const seedAdmins = async ({ environment = 'development' } = {}) => {
    const base = environment === 'production' ? prodAdmins : devAdmins;

    await Admin.deleteMany({});

    const payload = await Promise.all(
        base.map(async (admin) => ({
            ...admin,
            password: await bcrypt.hash(admin.password, 10),
            isVerified: true,
        }))
    );

    return Admin.insertMany(payload);
};

module.exports = seedAdmins;
