const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener monedas paginadas
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [data, total] = await Promise.all([
      prisma.currency.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { id: 'asc' }
      }),
      prisma.currency.count()
    ]);
    res.json({ data, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener monedas');
  }
});

// Crear nueva moneda
router.post('/', async (req, res) => {
  const { clave, descripcion, abreviatura, tipoCambio } = req.body;
  if (!clave || !descripcion || !abreviatura || typeof tipoCambio !== 'number') {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const nueva = await prisma.currency.create({
      data: { clave, descripcion, abreviatura, tipoCambio }
    });
    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar moneda');
  }
});

// Editar moneda
router.put('/:id', async (req, res) => {
  const { clave, descripcion, abreviatura, tipoCambio } = req.body;
  if (!clave || !descripcion || !abreviatura || typeof tipoCambio !== 'number') {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const actualizada = await prisma.currency.update({
      where: { id: parseInt(req.params.id) },
      data: { clave, descripcion, abreviatura, tipoCambio }
    });
    res.json(actualizada);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al editar moneda');
  }
});

// Eliminar moneda
router.delete('/:id', async (req, res) => {
  try {
    await prisma.currency.delete({ where: { id: parseInt(req.params.id) } });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar moneda');
  }
});

router.get('/next-clave', async (req, res) => {
  try {
    // Contar todos los registros de Currency
    const count = await prisma.currency.count();

    // Calcular y formatear la clave siguiente con 2 dígitos
    const nextNumber = count + 1;
    const clave = nextNumber.toString().padStart(2, '0');

    res.json({ clave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
