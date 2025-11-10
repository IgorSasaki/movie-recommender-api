// src/models/index.js
import { database } from '../config/database.js';
import { Movie } from './Movie.js';
import { Question } from './Question.js';
import { Answer } from './Answer.js';
import { env } from '../config/env.js'; // Assumindo que 'env' está configurado corretamente

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
if (env.nodeEnv === 'development') {
    database.sync({ alter: true }) // <--- MUDANÇA AQUI: de 'alter: true' para 'force: true'
        .then(() => console.log('✅ Models synced '))
        .catch(err => console.error('❌ Sync error :', err));
}

export { database, Movie, Question, Answer };
