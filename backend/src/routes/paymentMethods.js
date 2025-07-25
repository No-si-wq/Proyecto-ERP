const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los métodos de pago paginados
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
  const [data, total] = await Promise.all([
    prisma.payment_methods.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { clave: 'asc' },
      include: { moneda: true } 
    }),
    prisma.payment_methods.count()
  ]);

    res.json({ data, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener métodos de pago');
  }
});

// Crear nuevo método de pago
router.post('/', async (req, res) => {
  const { descripcion, tipo, clave, monedaId } = req.body;

  if (!clave || !descripcion || !tipo || !monedaId) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    await prisma.payment_methods.create({
      data: { clave, descripcion, tipo, monedaId: parseInt(monedaId) }
    });

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar método de pago');
  }
});

// Editar método de pago
router.put('/:id', async (req, res) => {
  const { descripcion, tipo, clave, monedaId } = req.body;
  if (!clave || !descripcion || !tipo || !monedaId) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    await prisma.payment_methods.update({
      where: { id: parseInt(req.params.id) },
      data: { clave, descripcion, tipo, monedaId: parseInt(monedaId) }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al editar método de pago');
  }
});

// Eliminar método de pago
router.delete('/:id', async (req, res) => {
  try {
    await prisma.payment_methods.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar método de pago');
  }
});

router.get('/next-clave', async (req, res) => {
  try {
    // Contar todos los registros de payment_methods usando Prisma
    const count = await prisma.payment_methods.count();

    // Calcular el siguiente número y formatearlo con 2 dígitos
    const nextNumber = count + 1;
    const clave = nextNumber.toString().padStart(2, '0');

    res.json({ clave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;