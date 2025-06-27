const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Importa a instância do Sequelize
const User = require('./User'); // Importa o modelo User para a associação

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: { // Chave estrangeira para o usuário que criou o orçamento
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User, // Referencia o modelo User
      key: 'id',   // A coluna 'id' do modelo User
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  client_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total_value: { // Valor total estimado do orçamento (calculado)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'canceled'), // Status do orçamento
    defaultValue: 'draft', // Ou 'pending' se a maioria dos orçamentos já nascerem enviados
    allowNull: false,
},
  notes: { // Observações adicionais para o orçamento
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pdf_path: { // Caminho ou URL para o PDF gerado
    type: DataTypes.STRING,
    allowNull: true,
  },
  has_watermark: { // Indica se o PDF tem marca d'água
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'budgets',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeUpdate: (budget, options) => {
      budget.updated_at = new Date();
    }
  }
});

// Define a associação: Um User tem muitos Budgets
User.hasMany(Budget, { foreignKey: 'user_id' });
Budget.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Budget;