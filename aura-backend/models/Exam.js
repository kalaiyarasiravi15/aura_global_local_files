const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  studiesAbroadId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'exams',
  timestamps: true
});

module.exports = Exam;
