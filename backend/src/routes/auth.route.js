const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Autenticación
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);

module.exports = router;