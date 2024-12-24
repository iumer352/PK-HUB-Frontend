const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Contract'),
        allowNull: false
    },
    salary: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    requirements: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('Active', 'Paused', 'Closed'),
        defaultValue: 'Active'
    }
});

module.exports = Job;
