const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Education = sequelize.define('education', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Education;
