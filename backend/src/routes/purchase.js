const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las compras
router.get('/', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: { items: { include: { product: true } }, supplier: true }
    });
    res.json(purchases);
  } catch (err) {
    res.status(500).send('Error al obtener compras');
  }
});

// Registrar compra y actualizar inventario
router.post('/', async (req, res) => {
  const { supplierId, items } = req.body;
  try {
    // Validar proveedor
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return res.status(400).json({ error: `Proveedor con id ${supplierId} no existe` });
    }

    // Validar productos
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(400).json({ error: `Producto con id ${item.productId} no existe` });
      }
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Crear la compra y sus items
    const purchase = await prisma.purchase.create({
      data: {
        supplierId,
        total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    // Actualizar inventario (sumar)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    res.status(201).json(purchase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la compra' });
  }
});

// Eliminar compra y restar stock (opcional)
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    // Busca la compra y sus items
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!purchase) return res.sendStatus(404);

    // Resta el inventario de los productos
    for (const item of purchase.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Elimina la compra (cascade debe estar activo o elimina manualmente items primero)
    await prisma.purchase.delete({ where: { id } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Error al eliminar compra');
  }
});

module.exports = router;