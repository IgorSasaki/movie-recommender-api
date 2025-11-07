import { database } from "../config/database.js";
import { env } from "../config/env.js";
import { Movie } from "./Movie.js";
import { Answer } from "./Answer.js";

if (env.nodeEnv === 'development') {
    database.sync({ alter: true })
        .then(() => console.log('✅ Models synchronized with database'))
        .catch(err => console.error('❌ Error sync', err));
}

export { database, Movie, Answer };
export default { Movie, Answer };
