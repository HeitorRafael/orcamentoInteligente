// backend/config/config.js

require('dotenv').config(); // Carrega as variáveis de ambiente

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Opcional: define se o Sequelize mostrará logs SQL no console
  },
  // Você pode adicionar configurações para 'test' e 'production' aqui futuramente
  test: {
    // ...
  },
  production: {
    // ...
  },
};