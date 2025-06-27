//Este middleware será responsável por verificar o token JWT presente nas requisições protegidas.
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Para buscar o usuário pelo ID do token

const JWT_SECRET = process.env.JWT_SECRET; // Pega do .env

const protect = async (req, res, next) => {
    let token;

    // Verifica se o token está no cabeçalho Authorization (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai o token
            token = req.headers.authorization.split(' ')[1];

            // Verifica o token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Busca o usuário pelo ID do token (excluindo a senha)
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
            }

            next(); // Prossegue para a próxima função do middleware/rota

        } catch (error) {
            console.error('Erro na autenticação do token:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Não autorizado, token expirado.' });
            }
            return res.status(401).json({ message: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, nenhum token.' });
    }
};

module.exports = { protect };