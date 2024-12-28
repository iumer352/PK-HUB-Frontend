const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  applicant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Add new stage column
  stage: {
    type: DataTypes.ENUM('HR', 'TECHNICAL', 'CULTURAL', 'FINAL'),
    allowNull: false,
    defaultValue: 'HR'  // Provide default for existing records
  },
  status: {
    type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  result: {
    type: DataTypes.ENUM('pending', 'pass', 'fail'),
    defaultValue: 'pending'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'interviews',
  timestamps: true,
  underscored: true
});


module.exports = Interview;