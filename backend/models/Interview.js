// models/Interview.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  interviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // HR round specific fields
  current_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Current salary in SAR'
  },
  expected_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Expected salary in SAR'
  },
  notice_period: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Notice period in days'
  },
  willing_to_relocate: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  willing_to_travel_saudi: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  tableName: 'interviews',
  timestamps: true,
  underscored: true
});

module.exports = Interview;