const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./Job');

const Applicant = sequelize.define('Applicant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resume: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected'),
    defaultValue: 'applied'
  }
}, {
  timestamps: true
});

// Define relationships
Applicant.belongsTo(Job);
Job.hasMany(Applicant);

module.exports = Applicant;