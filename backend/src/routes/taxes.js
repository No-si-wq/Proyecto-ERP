const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listado paginado
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    const [data, total] = await Promise.all([
      prisma.tax.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { id: 'asc' }
      }),
      prisma.tax.count()
    ]);
    res.json({ data, total });
  } catch (err) {
    res.status(500).send('Error al obtener impuestos');
  }
});


// Crear nuevo impuesto
router.post('/', async (req, res) => {
  const { clave, descripcion, percent } = req.body;
  if (!clave || !descripcion || typeof percent !== 'number') {
    return res.status(400).send('Faltan campos');
  }
  try {
    const nuevo = await prisma.tax.create({
      data: { clave, descripcion, percent }
    });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).send('Error al crear impuesto');
  }
});


// Editar impuesto
router.put('/:id', async (req, res) => {
  const { clave, descripcion, percent } = req.body;
  if (!clave || !descripcion || typeof percent !== 'number') {
    return res.status(400).send('Faltan campos');
  }
  try {
    const actualizado = await prisma.tax.update({
      where: { id: parseInt(req.params.id) },
      data: { clave, descripcion, percent }
    });
    res.json(actualizado);
  } catch (err) {
    res.status(500).send('Error al actualizar impuesto');
  }
});


// Eliminar impuesto
router.delete('/:id', async (req, res) => {
  try {
    await prisma.tax.delete({ where: { id: parseInt(req.params.id) } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Error al eliminar impuesto');
  }
});

// Obtener la siguiente clave
router.get('/next-clave', async (req, res) => {
  try {
    const count = await prisma.tax.count();
    const clave = (count + 1).toString().padStart(2, '0');
    res.json({ clave });
  } catch (err) {
    res.status(500).send('Error al generar clave');
  }
});

module.exports = router;
