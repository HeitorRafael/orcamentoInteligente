//Define os endpoints da API para as operações de Budget

const express = require('express');
const {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware'); // Importa o middleware de proteção

const router = express.Router();

// Todas as rotas de Budget são protegidas (exigem autenticação)
router.route('/')
    .post(protect, createBudget) // POST para criar
    .get(protect, getBudgets);   // GET para listar todos

router.route('/:id')
    .get(protect, getBudgetById)    // GET para obter por ID
    .put(protect, updateBudget)     // PUT para atualizar
    .delete(protect, deleteBudget); // DELETE para deletar

module.exports = router;