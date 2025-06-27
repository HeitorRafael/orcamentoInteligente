const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Importa a instância do Sequelize
const Budget = require('./Budget');           // Importa o modelo Budget
const ProductService = require('./ProductService'); // Importa o modelo ProductService

const BudgetItem = sequelize.define('BudgetItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  budget_id: { // Chave estrangeira para o orçamento ao qual este item pertence
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Budget, // Referencia o modelo Budget
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  product_service_id: { // Chave estrangeira para o ProductService original
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: ProductService, // Referencia o modelo ProductService
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: { // Nome do item (pode ser o nome do ProductService ou customizado)
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: { // Quantidade deste ProductService específica no orçamento
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00,
  },
  unit_price: { // Preço unitário deste item no orçamento (calculado pela IA)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_item_price: { // Preço total para este item (quantity * unit_price)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estimated_time_hours: { // Tempo estimado para este item específico no orçamento
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
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
  tableName: 'budget_items',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeUpdate: (budgetItem, options) => {
      budgetItem.updated_at = new Date();
    }
  }
});

// Define as associações
// Um Budget tem muitos BudgetItems
Budget.hasMany(BudgetItem, { foreignKey: 'budget_id' });
BudgetItem.belongsTo(Budget, { foreignKey: 'budget_id' });

// Um ProductService pode estar em muitos BudgetItems (através de diferentes orçamentos)
// E um BudgetItem pertence a um ProductService
ProductService.hasMany(BudgetItem, { foreignKey: 'product_service_id' });
BudgetItem.belongsTo(ProductService, { foreignKey: 'product_service_id' });

module.exports = BudgetItem;