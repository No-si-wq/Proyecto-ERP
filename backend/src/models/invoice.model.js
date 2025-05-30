const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  issueDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
  // Puedes agregar más campos según tus necesidades
}, {
  tableName: 'invoices',
  timestamps: false,
});

module.exports = Invoice;