// backend/models/User.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Importa a instância do Sequelize

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Gera um UUID v4 automaticamente
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Garante que o email seja único
    validate: {
      isEmail: true, // Valida se é um formato de email válido
    },
  },
  password: {
    type: DataTypes.STRING, // Armazenaremos a hash da senha aqui
    allowNull: false,
  },
  role: { // Ex: 'admin', 'user', 'premium'
    type: DataTypes.ENUM('basic', 'premium'), // Poderemos ter usuários com funcionalidades pagas
    defaultValue: 'basic',
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  company_name: { // Nome da empresa do prestador de serviço
    type: DataTypes.STRING,
    allowNull: true, // Pode ser nulo para autônomos
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zip_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'Brazil', // Considerando o contexto do Brasil
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  // Opções do modelo
  tableName: 'users', // Nome da tabela no banco de dados (por padrão o Sequelize pluraliza)
  timestamps: false, // Desabilita timestamps padrão do Sequelize (createdAt, updatedAt)
                     // estamos controlando manualmente com created_at e updated_at
  underscored: true, // Usa snake_case para nomes de colunas no banco de dados
  hooks: {
    beforeUpdate: (user, options) => {
      user.updated_at = new Date(); // Atualiza updated_at automaticamente antes de cada atualização
    }
  }
});

module.exports = User;