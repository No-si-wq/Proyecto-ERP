const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Utilidad para validar ID numérico
const validateNumericId = (id) => {
  const num = parseInt(id, 10);
  return isNaN(num) ? null : num;
};

router.get('/by-store/:storeId', async (req, res) => {
  const storeId = validateNumericId(req.params.storeId);
  if (!storeId) return res.status(400).json({ error: 'storeId inválido' });

  try {
    const productos = await prisma.product.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        price: true,
        category: { select: { name: true } },
        tax: { select: { percent: true } },
      },
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno al obtener productos' });
  }
});

router.post('/tienda/:storeId', async (req, res) => {
  const storeId = validateNumericId(req.params.storeId);
  const { name, sku, quantity, price, categoryId, taxId } = req.body;

  if (!storeId || !name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !taxId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios o inválidos' });
  }

  try {
    const producto = await prisma.product.create({
      data: {
        name,
        sku,
        quantity,
        price,
        store: { connect: { id: storeId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        tax: { connect: { id: taxId } },
      },
      include: {
        store: { select: { id: true, nombre: true } },
        category: { select: { id: true, name: true } },
        tax: { select: { id: true, clave: true, descripcion: true, percent: true } },
      },
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
      return res.status(409).json({ error: 'El SKU ya existe' });
    }

    res.status(500).json({ error: 'Error interno al crear producto' });
  }
});

router.put('/:id', async (req, res) => {
  const id = validateNumericId(req.params.id);
  const { name, sku, quantity, price, categoryId, taxId, storeId } = req.body;

  if (!id || !name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !taxId || !storeId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios o inválidos' });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        quantity,
        price,
        store: { connect: { id: storeId } },
        category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        tax: { connect: { id: taxId } },
      },
      include: {
        store: { select: { id: true, nombre: true } },
        category: { select: { id: true, name: true } },
        tax: { select: { id: true, clave: true, descripcion: true, percent: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
      return res.status(409).json({ error: 'El SKU ya existe' });
    }

    res.status(500).json({ error: 'Error interno al actualizar producto' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = validateNumericId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });

  try {
    await prisma.product.delete({ where: { id } });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno al eliminar producto' });
  }
});

module.exports = router;