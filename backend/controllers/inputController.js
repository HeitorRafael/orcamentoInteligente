//Lógica de negócio para o modelo Input

const Input = require('../models/Input');
const ProductService = require('../models/ProductService'); // Para verificar a propriedade do ProductService

// @desc    Criar um novo insumo para um ProductService
// @route   POST /api/inputs
// @access  Private
exports.createInput = async (req, res) => {
    const { product_service_id, name, description, quantity, unit, cost_per_unit, supplier_suggestion, supplier_link } = req.body;
    const user_id = req.user.id; // ID do usuário logado

    // Validação básica
    if (!product_service_id || !name || !quantity) {
        return res.status(400).json({ message: 'ID do produto/serviço, nome e quantidade são campos obrigatórios para um insumo.' });
    }

    try {
        // Primeiro, verifique se o ProductService existe e pertence ao usuário logado
        const productService = await ProductService.findOne({
            where: {
                id: product_service_id,
                user_id: user_id
            }
        });

        if (!productService) {
            return res.status(404).json({ message: 'Produto/Serviço não encontrado ou não pertence a este usuário.' });
        }

        const input = await Input.create({
            product_service_id,
            name,
            description,
            quantity,
            unit,
            cost_per_unit,
            supplier_suggestion,
            supplier_link,
        });

        res.status(201).json({
            message: 'Insumo criado com sucesso!',
            input: input.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao criar insumo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Obter todos os insumos de um ProductService específico do usuário logado
// @route   GET /api/inputs/:productServiceId
// @access  Private
exports.getInputsByProductService = async (req, res) => {
    const { productServiceId } = req.params; // ID do ProductService da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        // Verifique se o ProductService existe e pertence ao usuário logado
        const productService = await ProductService.findOne({
            where: {
                id: productServiceId,
                user_id: user_id
            }
        });

        if (!productService) {
            return res.status(404).json({ message: 'Produto/Serviço não encontrado ou não pertence a este usuário.' });
        }

        const inputs = await Input.findAll({
            where: { product_service_id: productServiceId },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: `Insumos para o ProductService ${productServiceId} obtidos com sucesso.`,
            inputs: inputs.map(input => input.toJSON()),
        });

    } catch (error) {
        console.error('Erro ao obter insumos por ProductService:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Obter um insumo específico do usuário logado por ID
// @route   GET /api/inputs/single/:id
// @access  Private
exports.getInputById = async (req, res) => {
    const { id } = req.params; // ID do insumo da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        const input = await Input.findByPk(id, {
            include: [{
                model: ProductService,
                where: { user_id: user_id }, // Garante que o ProductService pai pertence ao usuário
                attributes: [] // Não inclua os atributos do ProductService na resposta do input
            }]
        });

        if (!input) {
            return res.status(404).json({ message: 'Insumo não encontrado ou não pertence a este usuário.' });
        }

        res.status(200).json({
            message: 'Insumo obtido com sucesso.',
            input: input.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao obter insumo por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Atualizar um insumo existente
// @route   PUT /api/inputs/:id
// @access  Private
exports.updateInput = async (req, res) => {
    const { id } = req.params; // ID do insumo da URL
    const user_id = req.user.id; // ID do usuário logado
    const { name, description, quantity, unit, cost_per_unit, supplier_suggestion, supplier_link } = req.body;

    try {
        const input = await Input.findByPk(id, {
            include: [{
                model: ProductService,
                where: { user_id: user_id }, // Garante que o ProductService pai pertence ao usuário
                attributes: []
            }]
        });

        if (!input) {
            return res.status(404).json({ message: 'Insumo não encontrado ou não pertence a este usuário.' });
        }

        // Atualiza os campos
        input.name = name !== undefined ? name : input.name;
        input.description = description !== undefined ? description : input.description;
        input.quantity = quantity !== undefined ? quantity : input.quantity;
        input.unit = unit !== undefined ? unit : input.unit;
        input.cost_per_unit = cost_per_unit !== undefined ? cost_per_unit : input.cost_per_unit;
        input.supplier_suggestion = supplier_suggestion !== undefined ? supplier_suggestion : input.supplier_suggestion;
        input.supplier_link = supplier_link !== undefined ? supplier_link : input.supplier_link;
        // O campo updated_at é atualizado automaticamente pelo hook no modelo

        await input.save(); // Salva as mudanças no banco de dados

        res.status(200).json({
            message: 'Insumo atualizado com sucesso!',
            input: input.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao atualizar insumo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Deletar um insumo
// @route   DELETE /api/inputs/:id
// @access  Private
exports.deleteInput = async (req, res) => {
    const { id } = req.params; // ID do insumo da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        const input = await Input.findByPk(id, {
            include: [{
                model: ProductService,
                where: { user_id: user_id }, // Garante que o ProductService pai pertence ao usuário
                attributes: []
            }]
        });

        if (!input) {
            return res.status(404).json({ message: 'Insumo não encontrado ou não pertence a este usuário.' });
        }

        await input.destroy(); // Deleta o registro do banco de dados

        res.status(200).json({ message: 'Insumo deletado com sucesso!' });

    } catch (error) {
        console.error('Erro ao deletar insumo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};