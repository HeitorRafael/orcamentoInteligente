// backend/routes/index.js

const express = require('express');
const router = express.Router(); // Cria uma nova instância de router para agrupar todas as rotas

// Importa cada arquivo de rota individualmente
const userRoutes = require('./userRoutes');
const productServiceRoutes = require('./productServiceRoutes');
const inputRoutes = require('./inputRoutes');
const budgetRoutes = require('./budgetRoutes');
const budgetItemRoutes = require('./budgetItemRoutes');
const aiRoutes = require('./aiRoutes');

// Usa as rotas importadas, definindo seus caminhos base (sem o /api aqui, pois será adicionado em app.js)
// Ex: As rotas definidas em userRoutes (como '/') serão acessíveis via /users
router.use('/users', userRoutes);
router.use('/productservices', productServiceRoutes);
router.use('/inputs', inputRoutes);
router.use('/budgets', budgetRoutes);
router.use('/budgetitems', budgetItemRoutes);
router.use('/ai', aiRoutes);

module.exports = router; // Exporta este router que contém todas as sub-rotas