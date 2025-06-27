// backend/app.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { sequelize, testConnection } = require("./db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // Importa os middlewares de erro

// Importa todos os modelos (que se encontram no "index.js") garantindo que Sequelize os registre
const models = require("./models");

// Importa TODAS as rotas de uma vez do index.js da pasta routes
const apiRoutes = require("./routes"); // Node.js buscará por backend/routes/index.js

// Inicializa o servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://seufrotend.com.br", "https://www.seufrotend.com.br"] // Domínios do seu frontend em produção
    : ["http://localhost:3000", "http://localhost:5173"]; // Ex: React/Vite rodando em 3000 ou 5173

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem 'origin' (ex: Postman, mobile apps, curl) ou se a origem estiver na lista permitida
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Métodos HTTP permitidos
    credentials: true, // Permite que cookies, headers de autorização, etc. sejam enviados
  })
);

app.use(express.json());

// Rota de teste para verificar se a API está rodando
app.get("/", (req, res) => {
  res.send("API do BudgetGenerator está rodando!");
});

// Usa as rotas da API sob o prefixo /api
// Agora, todas as rotas começarão com /api
// Ex: POST /api/users/register, GET /api/productservices, etc.
app.use("/api", apiRoutes);

// Captura erros 404 (Rotas não encontradas)
app.use(notFound);
// Middleware de tratamento de erros global
app.use(errorHandler);

// Sincroniza todos os modelos com o banco de dados
// { force: true } irá DELETAR e recriar as tabelas a cada reinício do servidor.
// Use com extrema cautela e APENAS em desenvolvimento!
// Para produção, usaremos migrações.
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false });
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
