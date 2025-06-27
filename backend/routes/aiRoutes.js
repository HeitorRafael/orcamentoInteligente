// define o endpoint para a funcionalidade da IA.

const express = require('express');
const { generateBudgetItems } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // Importa o middleware de proteção

const router = express.Router();

// Rota para gerar sugestões de itens de orçamento com IA
router.post('/generate-budget-items', protect, generateBudgetItems);

module.exports = router;