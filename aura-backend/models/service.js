const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('service', {
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
    features: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('features');
            if (!rawValue) return [];
            try {
                return JSON.parse(rawValue);
            } catch {
                return [];
            }
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('features', JSON.stringify(value));
                return;
            }
            this.setDataValue('features', value || null);
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bannerImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    button: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Service;