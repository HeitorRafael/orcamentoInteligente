// backend/app.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const models = require('./models');
const apiRoutes = require('./routes'); // Garante que você está importando routes/index.js

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup (ensure it's configured as in previous steps)
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://seufrotend.com.br', 'https://www.seufrotend.com.br']
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do BudgetGenerator está rodando!');
});

app.use('/api', apiRoutes); // Certifique-se de que esta linha está presente

app.use(notFound);
app.use(errorHandler);

async function syncDatabase() {
    try {
        await sequelize.sync({ force: false });
        console.log('Todos os modelos foram sincronizados com sucesso.');
    } catch (error) {
        console.error('Erro ao sincronizar os modelos:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
    await testConnection();
    await syncDatabase();
});