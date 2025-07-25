const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear producto en una tienda
router.post('/', async (req, res) => {
  const { name, sku, storeId } = req.body;

  if (!name || !sku || !storeId) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const nuevoProducto = await prisma.product.create({
      data: {
        name,
        sku,
        store: { connect: { id: parseInt(storeId) } }
      }
    });

    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).send('Error al crear producto');
  }
});

// PUT /api/cajas/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { numeroDeCaja, descripcion, formatoNota, formatoCFDI } = req.body;

  if (!numeroDeCaja || !descripcion || !formatoNota || !formatoCFDI) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const updated = await prisma.cashRegister.update({
      where: { id },
      data: { numeroDeCaja, descripcion, formatoNota, formatoCFDI }
    });

    res.json(updated);
  } catch (err) {
    console.error('Error al editar caja:', err);
    res.status(500).send('Error al editar caja');
  }
});

// DELETE /api/cajas/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.cashRegister.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error al eliminar caja:', err);
    res.status(500).send('Error al eliminar caja');
  }
});

// Obtener productos por tienda
router.get('/por-tienda/:storeId', async (req, res) => {
  const storeId = parseInt(req.params.storeId);

  try {
    const productos = await prisma.product.findMany({
      where: { storeId },
      orderBy: { id: 'asc' }
    });

    res.json(productos);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
});

module.exports = router;
