const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const admin = sequelize.define('admin', {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Admin'
    },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: { isEmail: true } 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }
});

module.exports = admin;
