const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Complaint = sequelize.define('Complaint', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    complaintId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    roadId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      defaultValue: 'anonymous'
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    damageType: {
      type: DataTypes.ENUM('Pothole', 'Crack', 'Erosion', 'Flooding', 'Other'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    photoUrl: {
      type: DataTypes.TEXT('long'),
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
    status: {
      type: DataTypes.ENUM('Open', 'Under Review', 'Resolved', 'Rejected'),
      defaultValue: 'Open'
    },
    severity: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      defaultValue: 'Medium'
    },
    resolvedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolutionDescription: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'complaints',
    timestamps: true
  });

  return Complaint;
};
