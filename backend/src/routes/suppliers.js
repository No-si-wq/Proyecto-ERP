const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { id: 'asc' } });
    res.json(suppliers);
  } catch {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// Crear proveedor
router.post('/', async (req, res) => {
  const { name, rtn, email, phone, address } = req.body;
  try {
    const supplier = await prisma.supplier.create({
      data: { name, rtn, email, phone, address }
    });
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

module.exports = router;