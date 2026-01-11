const bcrypt = require('bcryptjs');
const { Admin } = require('./config/models');

(async () => {
  try {
    // Delete existing admin
    await Admin.destroy({ where: { username: 'admin' } });
    console.log('Old admin deleted');

    // Hash password manually
    const hashedPassword = await bcrypt.hash('Admin@456', 10);
    
    // Create new admin with pre-hashed password
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@smartroad.com',
      password: hashedPassword,
      fullName: 'Road Manager',
      role: 'admin',
      isActive: true
    });
    
    console.log('✓ Admin created successfully with hashed password');
    console.log('Username: admin');
    console.log('Password: Admin@456');
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
