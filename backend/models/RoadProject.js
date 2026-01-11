const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoadProject = sequelize.define('RoadProject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roadId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    roadName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    contractorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    constructionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    warrantyPeriodYears: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    warrantyEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    qrCodeData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    projectCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    roadLength: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Active', 'Completed', 'Under Maintenance'),
      defaultValue: 'Active'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'road_projects',
    timestamps: true
  });

  return RoadProject;
};
