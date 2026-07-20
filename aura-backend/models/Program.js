const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Program = sequelize.define('Program', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  totalSessions: {
    type: DataTypes.INTEGER,
    allowNull: false 
  },
  sessionDuration: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  timing: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  mockTests: {
    type: DataTypes.INTEGER,
    allowNull: false 
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false 
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'programs',
  timestamps: true
});

module.exports = Program;