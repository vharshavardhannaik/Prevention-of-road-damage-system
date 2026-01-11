const { Admin, sequelize } = require('./config/models');

(async () => {
  try {
    // Delete existing admin
    await Admin.destroy({ where: { username: 'admin' } });
    console.log('Old admin deleted');

    // Create new admin - the beforeCreate hook will hash the password
    await Admin.create({
      username: 'admin',
      email: 'admin@smartroad.com',
      password: 'Admin@456',  // Plain password - hook will hash it
      fullName: 'Road Manager',
      role: 'admin',
      isActive: true
    });
    
    console.log('✓ Admin created successfully');
    console.log('Username: admin');
    console.log('Password: Admin@456');
    
    // Verify it was created
    const adminRecord = await Admin.findOne({ where: { username: 'admin' } });
    console.log('Admin verified in database');
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
