const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enquiry = sequelize.define('enquiry', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    testMode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    education: {
        type: DataTypes.STRING,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Enquiry;
