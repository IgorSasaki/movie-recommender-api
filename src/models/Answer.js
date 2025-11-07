import { DataTypes } from 'sequelize';
import { database } from '../config/database.js';

export const Answer = database.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING(36), // UUID como string
    allowNull: false,
    field: 'session_id'
  },
  question: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  answer: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'answers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['session_id'] },
    { fields: ['question'] },
    { fields: ['session_id', 'question'], unique: true }
  ]
});

