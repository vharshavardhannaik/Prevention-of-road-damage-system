// Sample data and seeding script for Smart Road System
// Run with: node seed.js

const { sequelize, Contractor, RoadProject, Complaint } = require('./config/models');

require('dotenv').config();

const seedData = async () => {
  try {
    // Sync database schema
    await sequelize.sync({ alter: true });
    console.log('✓ Database synced');

    // Clear existing data
    await Complaint.destroy({ where: {}, truncate: true });
    await RoadProject.destroy({ where: {}, truncate: true });
    await Contractor.destroy({ where: {}, truncate: true });
    console.log('✓ Cleared existing data');

    console.log('\n📋 Creating sample contractors...');

    // Sample Contractors
    const contractors = await Contractor.bulkCreate([
      {
        contractorId: 'CONTR-001',
        name: 'BuildRight Infrastructure',
        email: 'buildright@construction.com',
        password: 'hashed_password_1', // In production, use bcrypt
        currentRating: 4.8,
        totalComplaints: 2,
        totalProjects: 5
      },
      {
        contractorId: 'CONTR-002',
        name: 'RoadMasters Inc',
        email: 'roadmasters@construction.com',
        password: 'hashed_password_2',
        currentRating: 3.2,
        totalComplaints: 15,
        totalProjects: 3
      },
      {
        contractorId: 'CONTR-003',
        name: 'Elite Construction Group',
        email: 'elite@construction.com',
        password: 'hashed_password_3',
        currentRating: 4.6,
        totalComplaints: 1,
        totalProjects: 4
      },
      {
        contractorId: 'CONTR-004',
        name: 'Quality Roads Ltd',
        email: 'quality@construction.com',
        password: 'hashed_password_4',
        currentRating: 2.1,
        totalComplaints: 28,
        totalProjects: 6
      },
      {
        contractorId: 'CONTR-005',
        name: 'Premium Infrastructure',
        email: 'premium@construction.com',
        password: 'hashed_password_5',
        currentRating: 4.2,
        totalComplaints: 5,
        totalProjects: 3
      }
    ]);

    console.log('✓ Created 5 sample contractors');

    console.log('\n📍 Creating sample road projects...');

    // Sample Road Projects
    const roads = await RoadProject.bulkCreate([
      {
        roadId: 'ROAD-001',
        roadName: 'Main Street Downtown',
        contractorId: contractors[0].id,
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Main Street, City Center',
        constructionDate: new Date('2015-01-15'),
        completionDate: new Date('2015-06-30'),
        warrantyPeriodYears: 10,
        warrantyEndDate: new Date('2025-06-30'),
        qrCodeData: 'https://example.com/qr/road-001',
        projectCost: 5000000,
        roadLength: 2.5,
        status: 'Active'
      },
      {
        roadId: 'ROAD-002',
        roadName: 'Highway 5 Express',
        contractorId: contractors[1].id,
        latitude: 13.0827,
        longitude: 80.2707,
        address: 'Highway 5, Northern Bypass',
        constructionDate: new Date('2014-01-15'),
        completionDate: new Date('2014-12-31'),
        warrantyPeriodYears: 10,
        warrantyEndDate: new Date('2024-12-31'),
        qrCodeData: 'https://example.com/qr/road-002',
        projectCost: 8000000,
        roadLength: 5.0,
        status: 'Active'
      },
      {
        roadId: 'ROAD-003',
        roadName: 'Park Avenue South',
        contractorId: contractors[2].id,
        latitude: 13.1939,
        longitude: 77.6245,
        address: 'Park Avenue, South District',
        constructionDate: new Date('2016-06-01'),
        completionDate: new Date('2017-02-28'),
        warrantyPeriodYears: 10,
        warrantyEndDate: new Date('2027-02-28'),
        qrCodeData: 'https://example.com/qr/road-003',
        projectCost: 6500000,
        roadLength: 3.2,
        status: 'Active'
      },
      {
        roadId: 'ROAD-004',
        roadName: 'Industrial Road Corridor',
        contractorId: contractors[3].id,
        latitude: 13.2334,
        longitude: 77.6233,
        address: 'Industrial Area, East Zone',
        constructionDate: new Date('2013-03-01'),
        completionDate: new Date('2013-11-30'),
        warrantyPeriodYears: 10,
        warrantyEndDate: new Date('2023-11-30'),
        qrCodeData: 'https://example.com/qr/road-004',
        projectCost: 7200000,
        roadLength: 4.0,
        status: 'Active'
      },
      {
        roadId: 'ROAD-005',
        roadName: 'Residential Colony Road',
        contractorId: contractors[4].id,
        latitude: 12.9689,
        longitude: 77.5941,
        address: 'Residential Area, West Side',
        constructionDate: new Date('2018-05-15'),
        completionDate: new Date('2019-01-31'),
        warrantyPeriodYears: 10,
        warrantyEndDate: new Date('2029-01-31'),
        qrCodeData: 'https://example.com/qr/road-005',
        projectCost: 4800000,
        roadLength: 2.0,
        status: 'Active'
      }
    ]);

    console.log('✓ Created 5 sample road projects');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\nSample Data:');
    console.log('Contractors:', contractors.map(c => ({ name: c.name, rating: c.currentRating })));
    console.log('Roads:', roads.map(r => ({ roadName: r.roadName, roadId: r.roadId })));
    console.log('\n📝 You can now use these Road IDs for testing:');
    console.log('   • ROAD-001: Main Street Downtown');
    console.log('   • ROAD-002: Highway 5 Express');
    console.log('   • ROAD-003: Park Avenue South');
    console.log('   • ROAD-004: Industrial Road Corridor');
    console.log('   • ROAD-005: Residential Colony Road');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
