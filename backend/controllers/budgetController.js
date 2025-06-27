//Lógica de negócio para o modelo Budget

const Budget = require("../models/Budget");
const User = require("../models/User"); // Para verificar a propriedade do orçamento

// @desc    Criar um novo orçamento
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res) => {
  const { client_name, project_name, status, total_price, notes } = req.body;
  const user_id = req.user.id; // ID do usuário logado

  // Validação básica
  if (!client_name || !project_name || !user_id) {
    return res
      .status(400)
      .json({
        message:
          "Nome do cliente, nome do projeto e ID do usuário são campos obrigatórios para um orçamento.",
      });
  }

  try {
    const budget = await Budget.create({
      user_id,
      client_name,
      project_name,
      status: status || "pending", // Define 'pending' como status padrão se não for fornecido
      total_price: total_price || 0.0, // Define 0 como preço total padrão
      notes,
    });

    res.status(201).json({
      message: "Orçamento criado com sucesso!",
      budget: budget.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter todos os orçamentos do usuário logado
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  const user_id = req.user.id; // ID do usuário logado

  try {
    const budgets = await Budget.findAll({
      where: { user_id },
      order: [["created_at", "DESC"]], // Ordena pelos mais recentes
    });

    res.status(200).json({
      message: "Orçamentos obtidos com sucesso.",
      budgets: budgets.map((budget) => budget.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter um orçamento específico do usuário logado por ID
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudgetById = async (req, res) => {
  const { id } = req.params; // ID do orçamento da URL
  const user_id = req.user.id; // ID do usuário logado

  try {
    const budget = await Budget.findOne({
      where: {
        id: id,
        user_id: user_id, // Garante que o usuário só possa acessar seus próprios orçamentos
      },
    });

    if (!budget) {
      return res
        .status(404)
        .json({
          message: "Orçamento não encontrado ou não pertence a este usuário.",
        });
    }

    res.status(200).json({
      message: "Orçamento obtido com sucesso.",
      budget: budget.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar um orçamento existente
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  const { id } = req.params; // ID do orçamento da URL
  const user_id = req.user.id; // ID do usuário logado
  const { client_name, project_name, status, total_price, notes } = req.body;

  try {
    const budget = await Budget.findOne({
      where: {
        id: id,
        user_id: user_id, // Garante que o usuário só possa atualizar seus próprios orçamentos
      },
    });

    if (!budget) {
      return res
        .status(404)
        .json({
          message: "Orçamento não encontrado ou não pertence a este usuário.",
        });
    }

    // Atualiza os campos
    budget.client_name =
      client_name !== undefined ? client_name : budget.client_name;
    budget.project_name =
      project_name !== undefined ? project_name : budget.project_name;
    budget.status = status !== undefined ? status : budget.status;
    budget.total_price =
      total_price !== undefined ? total_price : budget.total_price;
    budget.notes = notes !== undefined ? notes : budget.notes;
    // O campo updated_at é atualizado automaticamente pelo hook no modelo

    await budget.save(); // Salva as mudanças no banco de dados

    res.status(200).json({
      message: "Orçamento atualizado com sucesso!",
      budget: budget.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar um orçamento
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  const { id } = req.params; // ID do orçamento da URL
  const user_id = req.user.id; // ID do usuário logado

  try {
    const budget = await Budget.findOne({
      where: {
        id: id,
        user_id: user_id, // Garante que o usuário só possa deletar seus próprios orçamentos
      },
    });

    if (!budget) {
      return res
        .status(404)
        .json({
          message: "Orçamento não encontrado ou não pertence a este usuário.",
        });
    }

    await budget.destroy(); // Deleta o registro do banco de dados

    res.status(200).json({ message: "Orçamento deletado com sucesso!" });
  } catch (error) {
    next(error);
  }
};
