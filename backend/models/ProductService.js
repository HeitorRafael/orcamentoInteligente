const { DataTypes } = require('sequelize');
const { sequelize } = require('../db'); // Importa a instância do Sequelize
const User = require('./User'); // Importa o modelo User para definir a associação

const ProductService = sequelize.define('ProductService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: { // Chave estrangeira para o usuário que criou o produto/serviço
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User, // Referencia o modelo User
      key: 'id',   // A coluna 'id' do modelo User
    },
    onUpdate: 'CASCADE', // Se o ID do usuário mudar, atualiza aqui
    onDelete: 'CASCADE', // Se o usuário for deletado, deleta seus produtos/serviços
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Garante que o nome do produto/serviço seja único para um usuário
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: { // 'product' ou 'service'
    type: DataTypes.ENUM('product', 'service'),
    allowNull: false,
  },
  base_price: { // Preço base sugerido pelo usuário, antes da IA
    type: DataTypes.DECIMAL(10, 2), // 10 dígitos no total, 2 após a vírgula
    allowNull: true, // Pode ser nulo se a IA for sugerir tudo
  },
  estimated_time_hours: { // Tempo estimado em horas para o serviço/produção
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
  tableName: 'product_services',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeUpdate: (productService, options) => {
      productService.updated_at = new Date();
    }
  }
});

// Define a associação: Um User tem muitos ProductServices
User.hasMany(ProductService, { foreignKey: 'user_id' });
ProductService.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ProductService;