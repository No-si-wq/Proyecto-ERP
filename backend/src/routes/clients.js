const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { id: 'asc' } });
    res.json(clients);
  } catch {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Crear cliente
router.post('/', async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const client = await prisma.client.create({
      data: { name, email, phone, address }
    });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

module.exports = router;