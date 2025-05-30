const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// Reportes
router.get('/sales', reportController.salesReport);
router.get('/inventory', reportController.inventoryReport);
router.get('/purchases', reportController.purchaseReport);

module.exports = router;