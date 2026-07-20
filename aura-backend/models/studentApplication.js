const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentApplication = sequelize.define('student_application', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    studiesAbroadId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    testSectionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    educationId: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = StudentApplication;
