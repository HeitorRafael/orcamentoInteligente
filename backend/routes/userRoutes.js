// Define os endpoints da API para as operações de usuário.

const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Importa o middleware de proteção

const router = express.Router();

// Rotas públicas (não exigem autenticação)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rotas protegidas (exigem autenticação com JWT)
router.get('/profile', protect, getUserProfile); // A rota 'profile' usa o middleware 'protect'

module.exports = router;