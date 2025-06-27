//Define os endpoints da API para as operações de BudgetItem

const express = require('express');
const {
    createBudgetItem,
    getBudgetItemsByBudget,
    getBudgetItemById,
    updateBudgetItem,
    deleteBudgetItem
} = require('../controllers/budgetItemController');
const { protect } = require('../middleware/authMiddleware'); // Importa o middleware de proteção

const router = express.Router();

// Rota para criar um novo item de orçamento
router.post('/', protect, createBudgetItem);

// Rota para obter todos os itens de um orçamento específico
// A rota é /api/budgetitems/:budgetId para listar os itens de um Budget
router.get('/:budgetId', protect, getBudgetItemsByBudget);

// Rotas para operações em um item de orçamento específico por seu ID
// Use 'single' no path para evitar conflito com a rota acima que usa ':budgetId'
router.route('/single/:id')
    .get(protect, getBudgetItemById)
    .put(protect, updateBudgetItem)
    .delete(protect, deleteBudgetItem);

module.exports = router;