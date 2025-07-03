const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Crear nueva categoría
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear la categoría' });
  }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la categoría' });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la categoría' });
  }
});

module.exports = router;