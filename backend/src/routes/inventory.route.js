const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// Inventario
router.get('/', inventoryController.getAllProducts);
router.get('/:id', inventoryController.getProduct);
router.post('/', inventoryController.createProduct);
router.put('/:id', inventoryController.updateProduct);
router.delete('/:id', inventoryController.deleteProduct);

module.exports = router;