const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudiesAbroad = sequelize.define('studies_abroad', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    countryName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
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
            const raw = this.getDataValue('features');
            if (!raw) return [];
            try { return JSON.parse(raw); } catch { return []; }
        },
        set(value) {
            if (Array.isArray(value)) {
                this.setDataValue('features', JSON.stringify(value.slice(0, 10)));
            } else {
                this.setDataValue('features', value || null);
            }
        }
    }
});

module.exports = StudiesAbroad;
