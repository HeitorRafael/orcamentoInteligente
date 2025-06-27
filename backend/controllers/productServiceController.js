// Lógica de negócio para o modelo ProductService

const ProductService = require('../models/ProductService'); // Importa o modelo ProductService
const User = require('../models/User'); // Importa o modelo User (para associações e validação, se necessário)

// @desc    Criar um novo produto/serviço
// @route   POST /api/productservices
// @access  Private
exports.createProductService = async (req, res) => {
    const { name, description, type, base_price, estimated_time_hours } = req.body;
    const user_id = req.user.id; // O ID do usuário logado vem do middleware de autenticação

    // Validação básica
    if (!name || !type || !user_id) {
        return res.status(400).json({ message: 'Nome, tipo e ID do usuário são campos obrigatórios.' });
    }

    try {
        // Opcional: Verificar se já existe um produto/serviço com o mesmo nome para este usuário
        const existingProductService = await ProductService.findOne({
            where: {
                user_id: user_id,
                name: name
            }
        });

        if (existingProductService) {
            return res.status(400).json({ message: 'Você já tem um produto/serviço com este nome.' });
        }

        const productService = await ProductService.create({
            user_id,
            name,
            description,
            type,
            base_price,
            estimated_time_hours,
        });

        res.status(201).json({
            message: 'Produto/Serviço criado com sucesso!',
            productService: productService.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao criar produto/serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Obter todos os produtos/serviços do usuário logado
// @route   GET /api/productservices
// @access  Private
exports.getProductServices = async (req, res) => {
    const user_id = req.user.id; // O ID do usuário logado

    try {
        const productServices = await ProductService.findAll({
            where: { user_id },
            order: [['created_at', 'DESC']] // Ordena pelos mais recentes
        });

        res.status(200).json({
            message: 'Produtos/Serviços obtidos com sucesso.',
            productServices: productServices.map(ps => ps.toJSON()),
        });

    } catch (error) {
        console.error('Erro ao obter produtos/serviços:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Obter um produto/serviço específico do usuário logado por ID
// @route   GET /api/productservices/:id
// @access  Private
exports.getProductServiceById = async (req, res) => {
    const { id } = req.params; // ID do produto/serviço da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        const productService = await ProductService.findOne({
            where: {
                id: id,
                user_id: user_id // Garante que o usuário só possa acessar seus próprios produtos/serviços
            }
        });

        if (!productService) {
            return res.status(404).json({ message: 'Produto/Serviço não encontrado ou não pertence a este usuário.' });
        }

        res.status(200).json({
            message: 'Produto/Serviço obtido com sucesso.',
            productService: productService.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao obter produto/serviço por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Atualizar um produto/serviço existente
// @route   PUT /api/productservices/:id
// @access  Private
exports.updateProductService = async (req, res) => {
    const { id } = req.params; // ID do produto/serviço da URL
    const user_id = req.user.id; // ID do usuário logado
    const { name, description, type, base_price, estimated_time_hours } = req.body;

    try {
        const productService = await ProductService.findOne({
            where: {
                id: id,
                user_id: user_id // Garante que o usuário só possa atualizar seus próprios produtos/serviços
            }
        });

        if (!productService) {
            return res.status(404).json({ message: 'Produto/Serviço não encontrado ou não pertence a este usuário.' });
        }

        // Atualiza os campos
        productService.name = name || productService.name;
        productService.description = description || productService.description;
        productService.type = type || productService.type;
        productService.base_price = base_price || productService.base_price;
        productService.estimated_time_hours = estimated_time_hours || productService.estimated_time_hours;
        // O campo updated_at é atualizado automaticamente pelo hook no modelo

        await productService.save(); // Salva as mudanças no banco de dados

        res.status(200).json({
            message: 'Produto/Serviço atualizado com sucesso!',
            productService: productService.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao atualizar produto/serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Deletar um produto/serviço
// @route   DELETE /api/productservices/:id
// @access  Private
exports.deleteProductService = async (req, res) => {
    const { id } = req.params; // ID do produto/serviço da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        const productService = await ProductService.findOne({
            where: {
                id: id,
                user_id: user_id // Garante que o usuário só possa deletar seus próprios produtos/serviços
            }
        });

        if (!productService) {
            return res.status(404).json({ message: 'Produto/Serviço não encontrado ou não pertence a este usuário.' });
        }

        await productService.destroy(); // Deleta o registro do banco de dados

        res.status(200).json({ message: 'Produto/Serviço deletado com sucesso!' });

    } catch (error) {
        console.error('Erro ao deletar produto/serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};