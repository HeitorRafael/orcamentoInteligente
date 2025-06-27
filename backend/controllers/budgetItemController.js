//Lógica de negócio para o modelo BudgetItem

const BudgetItem = require('../models/BudgetItem');
const Budget = require('../models/Budget');
const ProductService = require('../models/ProductService');

// @desc    Criar um novo item para um orçamento
// @route   POST /api/budgetitems
// @access  Private
exports.createBudgetItem = async (req, res) => {
    const { budget_id, product_service_id, name, description, quantity, unit_price, total_item_price, estimated_time_hours } = req.body;
    const user_id = req.user.id; // ID do usuário logado

    // Validação básica
    if (!budget_id || !product_service_id || !name || !quantity || !unit_price || !total_item_price) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios (budget_id, product_service_id, name, quantity, unit_price, total_item_price) devem ser preenchidos.' });
    }

    try {
        // 1. Verifique se o Budget existe e pertence ao usuário logado
        const budget = await Budget.findOne({
            where: { id: budget_id, user_id: user_id }
        });
        if (!budget) {
            return res.status(404).json({ message: 'Orçamento não encontrado ou não pertence a este usuário.' });
        }

        // 2. Verifique se o ProductService existe e pertence ao usuário logado
        const productService = await ProductService.findOne({
            where: { id: product_service_id, user_id: user_id }
        });
        if (!productService) {
            return res.status(404).json({ message: 'Produto/Serviço não encontrado ou não pertence a este usuário.' });
        }

        // 3. Crie o BudgetItem
        const budgetItem = await BudgetItem.create({
            budget_id,
            product_service_id,
            name,
            description,
            quantity,
            unit_price,
            total_item_price,
            estimated_time_hours,
        });

        // Opcional: Atualizar o total_value do Budget pai (pode ser feito com triggers no DB ou aqui)
        // Por simplicidade, vamos calcular o total do orçamento e atualizar após a adição/remoção/atualização de itens
        const allBudgetItems = await BudgetItem.findAll({
            where: { budget_id: budget.id },
            attributes: ['total_item_price']
        });
        const newTotalValue = allBudgetItems.reduce((sum, item) => sum + parseFloat(item.total_item_price), 0);
        budget.total_value = newTotalValue;
        await budget.save();


        res.status(201).json({
            message: 'Item do orçamento criado com sucesso!',
            budgetItem: budgetItem.toJSON(),
            updated_budget_total: budget.total_value // Retorna o novo total do orçamento
        });

    } catch (error) {
        console.error('Erro ao criar item do orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Obter todos os itens de um orçamento específico do usuário logado
// @route   GET /api/budgetitems/:budgetId
// @access  Private
exports.getBudgetItemsByBudget = async (req, res) => {
    const { budgetId } = req.params; // ID do Budget da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        // 1. Verifique se o Budget existe e pertence ao usuário logado
        const budget = await Budget.findOne({
            where: { id: budgetId, user_id: user_id }
        });
        if (!budget) {
            return res.status(404).json({ message: 'Orçamento não encontrado ou não pertence a este usuário.' });
        }

        // 2. Obtenha os itens do orçamento
        const budgetItems = await BudgetItem.findAll({
            where: { budget_id: budgetId },
            include: [
                { model: ProductService, attributes: ['name', 'type', 'base_price'] } // Inclui alguns detalhes do ProductService
            ],
            order: [['created_at', 'ASC']]
        });

        res.status(200).json({
            message: `Itens do orçamento ${budgetId} obtidos com sucesso.`,
            budgetItems: budgetItems.map(item => item.toJSON()),
        });

    } catch (error) {
        console.error('Erro ao obter itens do orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Obter um item de orçamento específico do usuário logado por ID
// @route   GET /api/budgetitems/single/:id
// @access  Private
exports.getBudgetItemById = async (req, res) => {
    const { id } = req.params; // ID do BudgetItem da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        const budgetItem = await BudgetItem.findOne({
            where: { id: id },
            include: [
                {
                    model: Budget,
                    where: { user_id: user_id }, // Garante que o orçamento pai pertence ao usuário
                    attributes: [] // Não inclua os atributos do Budget na resposta direta do item
                },
                {
                    model: ProductService,
                    attributes: ['name', 'description', 'type', 'base_price', 'estimated_time_hours']
                }
            ]
        });

        if (!budgetItem) {
            return res.status(404).json({ message: 'Item do orçamento não encontrado ou não pertence a este usuário.' });
        }

        res.status(200).json({
            message: 'Item do orçamento obtido com sucesso.',
            budgetItem: budgetItem.toJSON(),
        });

    } catch (error) {
        console.error('Erro ao obter item do orçamento por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Atualizar um item de orçamento existente
// @route   PUT /api/budgetitems/:id
// @access  Private
exports.updateBudgetItem = async (req, res) => {
    const { id } = req.params; // ID do BudgetItem da URL
    const user_id = req.user.id; // ID do usuário logado
    const { name, description, quantity, unit_price, total_item_price, estimated_time_hours } = req.body;

    try {
        const budgetItem = await BudgetItem.findOne({
            where: { id: id },
            include: [{
                model: Budget,
                where: { user_id: user_id }, // Garante que o orçamento pai pertence ao usuário
                attributes: ['id', 'total_value'] // Inclua o ID e total_value do Budget para atualização
            }]
        });

        if (!budgetItem) {
            return res.status(404).json({ message: 'Item do orçamento não encontrado ou não pertence a este usuário.' });
        }

        const oldTotalItemPrice = parseFloat(budgetItem.total_item_price); // Guarda o valor antigo para recalcular o total do orçamento

        // Atualiza os campos do item
        budgetItem.name = name !== undefined ? name : budgetItem.name;
        budgetItem.description = description !== undefined ? description : budgetItem.description;
        budgetItem.quantity = quantity !== undefined ? quantity : budgetItem.quantity;
        budgetItem.unit_price = unit_price !== undefined ? unit_price : budgetItem.unit_price;
        budgetItem.total_item_price = total_item_price !== undefined ? total_item_price : budgetItem.total_item_price;
        budgetItem.estimated_time_hours = estimated_time_hours !== undefined ? estimated_time_hours : budgetItem.estimated_time_hours;

        await budgetItem.save(); // Salva as mudanças no item

        // Recalcular e atualizar o total do orçamento pai
        const budget = budgetItem.Budget; // O Budget já foi carregado na inclusão
        const allBudgetItems = await BudgetItem.findAll({
            where: { budget_id: budget.id },
            attributes: ['total_item_price']
        });
        const newTotalValue = allBudgetItems.reduce((sum, item) => sum + parseFloat(item.total_item_price), 0);
        budget.total_value = newTotalValue;
        await budget.save();


        res.status(200).json({
            message: 'Item do orçamento atualizado com sucesso!',
            budgetItem: budgetItem.toJSON(),
            updated_budget_total: budget.total_value // Retorna o novo total do orçamento
        });

    } catch (error) {
        console.error('Erro ao atualizar item do orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// @desc    Deletar um item de orçamento
// @route   DELETE /api/budgetitems/:id
// @access  Private
exports.deleteBudgetItem = async (req, res) => {
    const { id } = req.params; // ID do BudgetItem da URL
    const user_id = req.user.id; // ID do usuário logado

    try {
        const budgetItem = await BudgetItem.findOne({
            where: { id: id },
            include: [{
                model: Budget,
                where: { user_id: user_id }, // Garante que o orçamento pai pertence ao usuário
                attributes: ['id', 'total_value'] // Inclua o ID e total_value do Budget para atualização
            }]
        });

        if (!budgetItem) {
            return res.status(404).json({ message: 'Item do orçamento não encontrado ou não pertence a este usuário.' });
        }

        const budget = budgetItem.Budget; // O Budget já foi carregado na inclusão
        const oldTotalItemPrice = parseFloat(budgetItem.total_item_price); // Valor do item a ser deletado

        await budgetItem.destroy(); // Deleta o item

        // Recalcular e atualizar o total do orçamento pai
        const allBudgetItems = await BudgetItem.findAll({
            where: { budget_id: budget.id },
            attributes: ['total_item_price']
        });
        const newTotalValue = allBudgetItems.reduce((sum, item) => sum + parseFloat(item.total_item_price), 0);
        budget.total_value = newTotalValue;
        await budget.save();


        res.status(200).json({
            message: 'Item do orçamento deletado com sucesso!',
            updated_budget_total: budget.total_value // Retorna o novo total do orçamento
        });

    } catch (error) {
        console.error('Erro ao deletar item do orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};