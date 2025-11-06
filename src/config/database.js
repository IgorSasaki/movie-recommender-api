import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const database = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',  // Arquivo do banco
  logging: env.nodeEnv === 'development' ? console.log : false,
  define: {
    timestamps: true,      // createdAt, updatedAt automáticos
    underscored: true,     // snake_case no banco (user_id)
    freezeTableName: false // Pluraliza nomes (User → users)
  }
});
