import { database } from '../config/database.js';
import { Movie } from './Movie.js';
import { Session } from './Session.js';
import { Answer } from './Answer.js';
import { env } from '../config/env.js';

const models = { Movie, Session, Answer };

Session.hasMany(Answer, { foreignKey: 'session_id', as: 'answers' });
Answer.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// Sincronizar modelos (apenas em desenvolvimento!)
if (env.nodeEnv === 'development') {
    database.sync({ alter: true })
        .then(() => console.log('✅ Sync models'))
        .catch(err => console.error('❌ Sync error :', err));
}

export { database, Movie, Session, Answer };
export default models;