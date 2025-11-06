import { DataTypes } from 'sequelize';
import { database } from '../config/database.js';

export const Session = database.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired'),
    defaultValue: 'active'
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  underscored: true
});
