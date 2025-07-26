const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get("/products/by-store/:storeId", async (req, res) => {
  const storeId = parseInt(req.params.storeId);
  if (isNaN(storeId)) return res.status(400).json({ error: "storeId inválido" });

  try {
    const productos = await prisma.product.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        quantity: true,
        category: { select: { name: true } }
      },
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Crear nuevo producto
router.post('/tienda/:storeId', async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const { name, sku, quantity, price, categoryId, taxId } = req.body;

  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !taxId) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const nuevoProducto = await prisma.product.create({
      data: {
        name,
        sku,
        quantity,
        price,
        store: { connect: { id: storeId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        tax: { connect: { id: taxId } }
      },
      include: {
        store: { select: { id: true, nombre: true } },
        category: { select: { id: true, name: true } },
        tax: { select: { id: true, clave: true, descripcion: true, percent: true } }
      }
    });

    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002' && err.meta?.target?.includes('sku')) {
      res.status(409).send('El SKU ya existe');
    } else {
      res.status(500).send('Error al crear producto');
    }
  }
});

// Editar producto existente
router.put('/:id', async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { name, sku, quantity, price, categoryId, taxId, storeId } = req.body;

  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !taxId || !storeId) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const productoActualizado = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        quantity,
        price,
        store: { connect: { id: storeId } },
        category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        tax: { connect: { id: taxId } }
      },
      include: {
        store: { select: { id: true, nombre: true } },
        category: { select: { id: true, name: true } },
        tax: { select: { id: true, clave: true, descripcion: true, percent: true } }
      }
    });

    res.json(productoActualizado);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002' && err.meta?.target?.includes('sku')) {
      res.status(409).send('El SKU ya existe');
    } else {
      res.status(500).send('Error al editar producto');
    }
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await prisma.product.delete({
      where: { id }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar producto');
  }
});

module.exports = router;