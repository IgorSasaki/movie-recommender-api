// src/models/Answer.js
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
    field: 'session_id'
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_id',
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  answer: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array de opções selecionadas pelo usuário'
  }
}, {
  tableName: 'answers',
  timestamps: true,
  indexes: [
    { fields: ['session_id'] },
    { fields: ['question_id'] },
    { fields: ['session_id', 'question_id'], unique: true }
  ]
});
