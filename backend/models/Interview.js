const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('HR', 'TECHNICAL', 'CULTURAL', 'FINAL'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  result: {
    type: DataTypes.ENUM('pending', 'pass', 'fail'),
    defaultValue: 'pending'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed feedback about the interview'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the interview'
  }
}, {
  tableName: 'interviews',
  timestamps: true,
  underscored: true
});

module.exports = Interview;