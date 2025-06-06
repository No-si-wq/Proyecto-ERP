const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registrar una venta (factura de venta)
router.post('/venta', async (req, res) => {
  const { client, items } = req.body;
  try {
    // Validar stock para todos los items
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(400).json({ error: `Producto con id ${item.productId} no existe` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ${product.name}` });
      }
    }
    // Calcular total
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Crear la factura con los items
    const invoice = await prisma.invoice.create({
      data: {
        client,
        type: "VENTA",
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
      include: { items: true },
    });

    // Actualizar inventario
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la venta y generar la factura' });
  }
});

// Registrar una compra (factura de compra)
router.post('/compra', async (req, res) => {
  const { supplier, items } = req.body;
  try {
    // Validar stock para todos los items
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(400).json({ error: `Producto con id ${item.productId} no existe` });
      }
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Crear la factura tipo compra
    const invoice = await prisma.invoice.create({
      data: {
        client: supplier, 
        type: "COMPRA",
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
      include: { items: true },
    });

    // Actualizar inventario (sumar)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la compra y generar la factura' });
  }
});

module.exports = router;