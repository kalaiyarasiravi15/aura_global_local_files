const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('banner', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    button: {
        type: DataTypes.STRING,
        allowNull: true
    },
    buttonLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Banner;