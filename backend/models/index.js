//Centraliza a importação e exportação dos seus modelos, tornando app.js 
//(e futuros arquivos que precisarem de múltiplos modelos) mais limpo.

const User = require('./User');
const ProductService = require('./ProductService');
const Input = require('./Input');
const Budget = require('./Budget');
const BudgetItem = require('./BudgetItem');

// As associações já estão definidas nos arquivos de modelo individuais
// (ex: User.hasMany(ProductService) está em ProductService.js)
// Ao importar os modelos aqui, essas associações são executadas.

module.exports = {
  User,
  ProductService,
  Input,
  Budget,
  BudgetItem,
};