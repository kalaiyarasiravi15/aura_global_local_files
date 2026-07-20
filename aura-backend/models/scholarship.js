const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Scholarship = sequelize.define('scholarship', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    studiesAbroadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'studies_abroads', key: 'id' },
        onDelete: 'CASCADE'
    },
    coursename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Scholarship;
