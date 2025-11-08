// src/models/index.js
import { database } from '../config/database.js';
import { Movie } from './Movie.js';
import { Question } from './Question.js';
import { Answer } from './Answer.js';

// Definir relacionamentos
Question.hasMany(Answer, {
    foreignKey: 'question_id',
    as: 'answers'
});

Answer.belongsTo(Question, {
    foreignKey: 'question_id',
    as: 'question'
});

// Sincronizar models (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    database.sync({ alter: true })
        .then(() => console.log('✅ Models sincronizados'))
        .catch(err => console.error('❌ Erro ao sincronizar:', err));
}

export { database, Movie, Question, Answer };
