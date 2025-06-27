//define os endpoints da API para as operações de ProductService

const express = require('express');
const {
    createProductService,
    getProductServices,
    getProductServiceById,
    updateProductService,
    deleteProductService
} = require('../controllers/productServiceController');
const { protect } = require('../middleware/authMiddleware'); // Importa o middleware de proteção

const router = express.Router();

// Todas as rotas de ProductService são protegidas (exigem autenticação)
router.route('/')
    .post(protect, createProductService) // POST para criar
    .get(protect, getProductServices);   // GET para listar todos

router.route('/:id')
    .get(protect, getProductServiceById)    // GET para obter por ID
    .put(protect, updateProductService)     // PUT para atualizar
    .delete(protect, deleteProductService); // DELETE para deletar

module.exports = router;