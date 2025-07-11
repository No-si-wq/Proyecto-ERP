const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { id: 'asc' } });
    res.json(clients);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear cliente
router.post('/', async (req, res) => {
  const { name, rtn, email, phone, address } = req.body;
  try {
    const client = await prisma.client.create({
      data: { name, rtn, email, phone, address }
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;