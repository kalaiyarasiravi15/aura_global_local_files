const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TestSection = sequelize.define('test_section', {
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
    startMonth: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endMonth: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = TestSection;
