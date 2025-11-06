import { DataTypes } from 'sequelize';
import { database } from '../config/database.js';

export const Answer = database.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'session_id',
    references: {
      model: 'sessions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  question: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  answer: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'answers',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['session_id', 'question']
    }
  ]
});
