// backend/app.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { sequelize, testConnection } = require("./db");

// Importa todos os modelos (que se encontram no "index.js") garantindo que Sequelize os registre
const models = require('./models');

// Importa TODAS as rotas de uma vez do index.js da pasta routes
const apiRoutes = require('./routes'); // Node.js buscará por backend/routes/index.js

// Inicializa o servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de teste para verificar se a API está rodando
app.get("/", (req, res) => {
  res.send("API do BudgetGenerator está rodando!");
});

// Usa as rotas da API sob o prefixo /api
// Agora, todas as rotas começarão com /api
// Ex: POST /api/users/register, GET /api/productservices, etc.
app.use('/api', apiRoutes);



// Sincroniza todos os modelos com o banco de dados
// { force: true } irá DELETAR e recriar as tabelas a cada reinício do servidor.
// Use com extrema cautela e APENAS em desenvolvimento!
// Para produção, usaremos migrações.
async function syncDatabase() {
    try {
        await sequelize.sync({ force: false });
        console.log('Todos os modelos foram sincronizados com sucesso.');
    } catch (error) {
        console.error('Erro ao sincronizar os modelos:', error);
    }
}

// Inicializa o servidor e testa a conexão com o banco de dados
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  await testConnection(); // Testa a conexão com o banco de dados
  await syncDatabase(); // Sincroniza os modelos (cria as tabelas)
});
