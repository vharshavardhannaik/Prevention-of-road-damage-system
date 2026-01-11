const { sequelize, Admin, Contractor, RoadProject, Complaint } = require('./config/models');

const seedDatabase = async () => {
  try {
    // Create super admin user
    const superAdminExists = await Admin.findOne({ where: { username: 'superadmin' } });
    
    if (!superAdminExists) {
      await Admin.create({
        username: 'superadmin',
        email: 'admin@smartroad.com',
        password: 'Admin@123', // Change this in production
        fullName: 'Super Administrator',
        role: 'super_admin',
        isActive: true
      });
      console.log('✓ Super admin created: username=superadmin, password=Admin@123');
    } else {
      console.log('✓ Super admin already exists');
    }

    // Create a sample admin user
    const adminExists = await Admin.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        email: 'roadmanager@smartroad.com',
        password: 'Admin@456', // Change this in production
        fullName: 'Road Manager',
        role: 'admin',
        isActive: true
      });
      console.log('✓ Admin user created: username=admin, password=Admin@456');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Do not seed contractors - users will add them manually

    console.log('\n📋 Default Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Username: superadmin');
    console.log('  Password: Admin@123');
    console.log('');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: Admin@456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return Promise.resolve();
  } catch (error) {
    console.error('Error seeding admin data:', error);
    return Promise.resolve();
  }
};

module.exports = seedDatabase;
