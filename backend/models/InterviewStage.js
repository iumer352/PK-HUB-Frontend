// models/InterviewStage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InterviewStage = sequelize.define('InterviewStage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  interview_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'interviews',
      key: 'id'
    }
  },
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stage_lookups',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  result: {
    type: DataTypes.ENUM('pending', 'pass', 'fail'),
    defaultValue: 'pending'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'interview_stages',
  timestamps: true,
  underscored: true
});

module.exports = InterviewStage;