// backend/db/index.js

const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Pega a configuração para o ambiente de desenvolvimento
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Cria uma nova instância do Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    // Adicionando algumas opções de pool para melhorar o desempenho em ambientes de alta concorrência
    pool: {
      max: 5,   // Número máximo de conexões no pool
      min: 0,   // Número mínimo de conexões no pool
      acquire: 30000, // Tempo máximo, em ms, que o pool tentará adquirir uma conexão antes de gerar um erro
      idle: 10000 // Tempo máximo, em ms, que uma conexão pode ficar ociosa antes de ser liberada
    }
  }
);

// Função para testar a conexão com o banco de dados
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
}

// Exporta a instância do Sequelize e a função de teste de conexão
module.exports = {
  sequelize,
  testConnection,
};