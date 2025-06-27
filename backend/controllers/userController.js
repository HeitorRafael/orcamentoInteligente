// lógica de negócio para o modelo User

const User = require("../models/User"); // Importa o modelo User
const bcrypt = require("bcryptjs"); // Para hash de senhas
const jwt = require("jsonwebtoken"); // Para JSON Web Tokens

// Segredo do JWT (coloque no .env em produção!)
const JWT_SECRET = process.env.JWT_SECRET || "umSegredoSuperSecretoParaJWT";
// Tempo de expiração do token (ex: '1h', '7d')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"; // Token válido por 1 dia

// Helper para gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// @desc    Registrar um novo usuário
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    company_name,
    contact_phone,
    address,
    city,
    state,
    zip_code,
    country,
  } = req.body;

  // Validação básica de entrada
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({
        message:
          "Por favor, preencha todos os campos obrigatórios: nome, email e senha.",
      });
  }

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Usuário já existe com este email." });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10); // Gera um salt para o hash
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o usuário
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      company_name,
      contact_phone,
      address,
      city,
      state,
      zip_code,
      country,
    });

    if (user) {
      res.status(201).json({
        message: "Usuário registrado com sucesso!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_name: user.company_name,
          contact_phone: user.contact_phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zip_code: user.zip_code,
          country: user.country,
        },
        token: generateToken(user.id), // Gera e envia o token JWT
      });
    } else {
      res.status(400).json({ message: "Dados do usuário inválidos." });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Autenticar usuário e obter token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Por favor, insira email e senha." });
  }

  try {
    // Encontra o usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Credenciais inválidas: Usuário não encontrado." });
    }

    // Compara a senha fornecida com a senha hash do banco de dados
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      res.status(200).json({
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_name: user.company_name,
        },
        token: generateToken(user.id), // Gera e envia o token JWT
      });
    } else {
      res
        .status(401)
        .json({ message: "Credenciais inválidas: Senha incorreta." });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Obter dados do perfil do usuário
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  // O objeto 'req.user' é adicionado pelo middleware de autenticação (authMiddleware)
  // Se a requisição chegou até aqui, significa que o usuário está autenticado
  try {
    // Busque o usuário novamente (ou use os dados de req.user se já forem suficientes)
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "created_at", "updated_at"] }, // Exclui a senha e timestamps
    });

    if (user) {
      res.status(200).json({
        message: "Dados do perfil do usuário obtidos com sucesso.",
        user: user.toJSON(), // Converte a instância Sequelize para um objeto JS puro
      });
    } else {
      res.status(404).json({ message: "Usuário não encontrado." });
    }
  } catch (error) {
    next(error);
  }
};
