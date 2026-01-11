const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite for development (no server needed), MySQL for production
const sequelize = process.env.NODE_ENV === 'production'
  ? new Sequelize(
      process.env.DB_NAME || 'smart_road_system',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../smart_road_system.db'),
      logging: false
    });

module.exports = sequelize;
