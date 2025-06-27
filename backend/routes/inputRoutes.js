//define os endpoints da API para as operações de Input

const express = require('express');
const {
    createInput,
    getInputsByProductService,
    getInputById,
    updateInput,
    deleteInput
} = require('../controllers/inputController');
const { protect } = require('../middleware/authMiddleware'); // Importa o middleware de proteção

const router = express.Router();

// Rota para criar um novo insumo
router.post('/', protect, createInput);

// Rota para obter todos os insumos de um ProductService específico
// Note que a rota é /api/inputs/:productServiceId para listar os insumos de um ProductService
router.get('/:productServiceId', protect, getInputsByProductService);

// Rotas para operações em um insumo específico por seu ID
// Use 'single' no path para evitar conflito com a rota acima que usa ':productServiceId'
router.route('/single/:id')
    .get(protect, getInputById)
    .put(protect, updateInput)
    .delete(protect, deleteInput);

module.exports = router;