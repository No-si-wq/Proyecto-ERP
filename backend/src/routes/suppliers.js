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

// Actualizar proveedor por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, rtn, email, phone, address } = req.body;
  try {
    const updatedSupplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, rtn, email, phone, address }
    });
    res.json(updatedSupplier);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

// Eliminar proveedor por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.supplier.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});

module.exports = router;