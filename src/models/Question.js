import { DataTypes } from 'sequelize';
import { database } from '../config/database';

export const Question = database.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    options: {
        type: DataTypes.JSON,
        allowNull: false
    },
}, {
    tableName: 'questions',
    timestamps: true
});

