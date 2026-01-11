const { sequelize, Admin } = require('./config/models');

const initAdmin = async () => {
  try {
    // Sync all models first
    await sequelize.sync({ alter: true });
    console.log('✓ Database synced');

    // Create admin
    const [admin, created] = await Admin.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@smartroad.com',
        password: 'Admin@456',
        fullName: 'Road Manager',
        role: 'admin',
        isActive: true
      }
    });
    
    console.log(created ? '✓ Admin created successfully' : '✓ Admin already exists');
    console.log('Credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin@456');
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
};

initAdmin();
