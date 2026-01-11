const sequelize = require('./database');
const AdminModel = require('../models/Admin');
const ContractorModel = require('../models/Contractor');
const RoadProjectModel = require('../models/RoadProject');
const ComplaintModel = require('../models/Complaint');
const RatingModel = require('../models/Rating');

// Initialize models
const Admin = AdminModel(sequelize);
const Contractor = ContractorModel(sequelize);
const RoadProject = RoadProjectModel(sequelize);
const Complaint = ComplaintModel(sequelize);
const Rating = RatingModel(sequelize);

// Define associations
Contractor.hasMany(RoadProject, { foreignKey: 'contractorId', as: 'projects' });
RoadProject.belongsTo(Contractor, { foreignKey: 'contractorId', as: 'contractor' });

RoadProject.hasMany(Complaint, { foreignKey: 'roadId', as: 'complaints' });
Complaint.belongsTo(RoadProject, { foreignKey: 'roadId', as: 'road' });

Contractor.hasMany(Rating, { foreignKey: 'contractorId', as: 'ratings' });
Rating.belongsTo(Contractor, { foreignKey: 'contractorId', as: 'contractor' });

RoadProject.hasMany(Rating, { foreignKey: 'roadId', as: 'roadRatings' });
Rating.belongsTo(RoadProject, { foreignKey: 'roadId', as: 'road' });

module.exports = {
  sequelize,
  Admin,
  Contractor,
  RoadProject,
  Complaint,
  Rating
};
