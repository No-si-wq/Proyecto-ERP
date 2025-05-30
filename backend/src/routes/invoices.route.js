const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

// CRUD de facturación
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.delete('/:id', invoiceController.delete);
router.get('/:id/pdf', invoiceController.generatePDF);

module.exports = router;