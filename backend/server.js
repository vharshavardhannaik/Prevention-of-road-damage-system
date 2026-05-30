const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, Contractor, RoadProject, Complaint, Admin, Rating } = require('./config/models');
const seedAdmin = require('./seedAdmin');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('✓ MySQL connected successfully');
    // Sync database
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log('✓ Database tables synced');
    // Seed admin accounts
    return seedAdmin();
  })
  .catch(err => {
    console.error('✗ Database connection error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/contractors', require('./routes/contractors'));
app.use('/api/roads', require('./routes/roads'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Road System Backend running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💾 Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'smart_road_system'}\n`);
});

