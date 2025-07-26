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
    // Obtener todas las claves existentes ordenadas ascendentemente
    const existing = await prisma.tax.findMany({
      select: { clave: true },
      orderBy: { clave: 'asc' }
    });

    // Convertir a un conjunto de claves numéricas
    const existingNumbers = new Set(
      existing
        .map(pm => parseInt(pm.clave))
        .filter(n => !isNaN(n))
    );

    // Buscar el menor número disponible
    let next = 1;
    while (existingNumbers.has(next)) {
      next++;
    }

    const clave = next.toString().padStart(2, '0');
    res.json({ clave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/check-clave/:clave', async (req, res) => {
  const { clave } = req.params;

  try {
    const exists = await prisma.tax.findFirst({
      where: { clave: clave }
    });

    res.json({ exists: !!exists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar la clave' });
  }
});

module.exports = router;
