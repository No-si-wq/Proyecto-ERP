const Invoice = require('../models/invoice.model');

async function getAllInvoices() {
  return await Invoice.findAll();
}

async function getInvoiceById(id) {
  return await Invoice.findByPk(id);
}

async function createInvoice(data) {
  return await Invoice.create(data);
}

async function updateInvoice(id, data) {
  const invoice = await Invoice.findByPk(id);
  if (!invoice) throw new Error('Invoice not found');
  return await invoice.update(data);
}

async function deleteInvoice(id) {
  const invoice = await Invoice.findByPk(id);
  if (!invoice) throw new Error('Invoice not found');
  await invoice.destroy();
  return true;
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};