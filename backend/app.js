// backend/app.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { sequelize, testConnection } = require("./db");

// Importa os modelos (garantindo que Sequelize os registre)
const User = require("./models/User");
const ProductService = require("./models/ProductService"); 
const Input = require('./models/Input');
const Budget = require('./models/Budget');
const BudgetItem = require('./models/BudgetItem');

// Importa as rotas
const userRoutes = require('./routes/userRoutes');
const productServiceRoutes = require('./routes/productServiceRoutes');
const inputRoutes = require('./routes/inputRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const budgetItemRoutes = require('./routes/budgetItemRoutes');

// Inicializa o servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de teste para verificar se a API está rodando
app.get("/", (req, res) => {
  res.send("API do BudgetGenerator está rodando!");
});

// Usa as rotas de usuário
app.use('/api/users', userRoutes); // Todas as rotas em userRoutes começarão com /api/users
// Usa as rotas de ProductService
app.use('/api/productservices', productServiceRoutes); // Todas as rotas em productServiceRoutes começarão com /api/productservices
// Usa as rotas de Input
app.use('/api/inputs', inputRoutes); // Todas as rotas em inputRoutes começarão com /api/inputs
// Usa as rotas de Budget
app.use('/api/budgets', budgetRoutes); // Todas as rotas em budgetRoutes começarão com /api/budgets
// Usa as rotas de BudgetItem
app.use('/api/budgetitems', budgetItemRoutes); // Todas as rotas em budgetItemRoutes começarão com /api/budgetitems



// Sincroniza todos os modelos com o banco de dados
// { force: true } irá DELETAR e recriar as tabelas a cada reinício do servidor.
// Use com extrema cautela e APENAS em desenvolvimento!
// Para produção, usaremos migrações.
async function syncDatabase() {
  try {
    require("./models/User");
    require("./models/ProductService");
    require('./models/Input');
    require('./models/Budget');
    require('./models/BudgetItem');
    await sequelize.sync({ force: false }); // Mude para { force: true } APENAS  se quiser que as tabelas sejam sempre recriadas
    console.log("Todos os modelos foram sincronizados com sucesso.");
  } catch (error) {
    console.error("Erro ao sincronizar os modelos:", error);
  }
}

// Inicializa o servidor e testa a conexão com o banco de dados
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  await testConnection(); // Testa a conexão com o banco de dados
  await syncDatabase(); // Sincroniza os modelos (cria as tabelas)
});
