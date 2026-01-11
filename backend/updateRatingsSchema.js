const { sequelize } = require('./config/models');

async function updateRatingsSchema() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Check if ratings table exists and update schema
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ratings_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contractorId INTEGER NOT NULL,
        roadId INTEGER,
        userId VARCHAR(255) DEFAULT 'anonymous',
        userEmail VARCHAR(255),
        ratingValue REAL NOT NULL,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ New ratings table created');

    // Copy existing data if any
    await sequelize.query(`
      INSERT OR IGNORE INTO ratings_new (id, contractorId, roadId, userId, userEmail, ratingValue, comment, createdAt, updatedAt)
      SELECT id, contractorId, roadId, userId, userEmail, ratingValue, comment, createdAt, updatedAt
      FROM ratings
      WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='ratings');
    `);

    console.log('✓ Data copied from old table');

    // Drop old table and rename new one
    await sequelize.query(`DROP TABLE IF EXISTS ratings;`);
    await sequelize.query(`ALTER TABLE ratings_new RENAME TO ratings;`);

    console.log('✓ Schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error updating schema:', error.message);
    process.exit(1);
  }
}

updateRatingsSchema();
