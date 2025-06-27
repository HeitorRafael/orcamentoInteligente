const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Importa a instância do Sequelize
const ProductService = require('./ProductService'); // Importa o modelo ProductService para a associação

const Input = sequelize.define('Input', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  product_service_id: { // Chave estrangeira para o ProductService ao qual este insumo pertence
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ProductService, // Referencia o modelo ProductService
      key: 'id',            // A coluna 'id' do modelo ProductService
    },
    onUpdate: 'CASCADE', // Se o ID do ProductService mudar, atualiza aqui
    onDelete: 'CASCADE', // Se o ProductService for deletado, deleta seus insumos
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: { // Quantidade do insumo necessária para o ProductService
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00,
  },
  unit: { // Unidade de medida (ex: 'kg', 'metro', 'unidade', 'litro')
    type: DataTypes.STRING,
    allowNull: true,
  },
  cost_per_unit: { // Custo por unidade do insumo (pode ser preenchido pela IA)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  supplier_suggestion: { // Sugestão de fornecedor pela IA
    type: DataTypes.STRING,
    allowNull: true,
  },
  supplier_link: { // Link para o fornecedor sugerido
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true, // Valida se é um formato de URL válido
    },
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
  tableName: 'inputs',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeUpdate: (input, options) => {
      input.updated_at = new Date();
    }
  }
});

// Define a associação: Um ProductService tem muitos Inputs
ProductService.hasMany(Input, { foreignKey: 'product_service_id' });
Input.belongsTo(ProductService, { foreignKey: 'product_service_id' });

module.exports = Input;