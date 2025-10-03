const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createFirstAdmin() {
    try {
        // Check if any admin already exists
        const existingAdmin = await prisma.admin.findFirst();

        if (existingAdmin) {
            console.log('❌ Admin already exists!');
            console.log(`Existing admin: ${existingAdmin.username} (${existingAdmin.email})`);
            return;
        }

        // Admin credentials
        const adminData = {
            username: 'admin',
            email: 'admin@queue.com',
            name: 'Super Admin',
            password: 'admin123' // Will be hashed
        };

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Create admin
        const admin = await prisma.admin.create({
            data: {
                username: adminData.username,
                email: adminData.email,
                name: adminData.name,
                password: hashedPassword,
                isActive: true
            }
        });

        console.log('✅ First admin created successfully!');
        console.log('📋 Login Credentials:');
        console.log(`   Username: ${adminData.username}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   ID: ${admin.id}`);
        console.log('\n🔐 You can now login using these credentials!');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createFirstAdmin();