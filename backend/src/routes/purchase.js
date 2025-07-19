const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registrar una compra (factura de compra) con múltiples productos
router.post('/', async (req, res) => {
  const { supplierId, productos } = req.body; // productos: [{ productoId, cantidad, price }]
  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'La compra debe tener al menos un producto' });
    }

    // Calcular el total general
    const total = productos.reduce((acc, item) => acc + item.cantidad * item.price, 0);

    // Crear la compra con varios items
    const purchase = await prisma.purchase.create({
      data: {
        supplierId: supplierId,
        total: total,
        items: {
          create: productos.map(item => ({
            productId: item.productoId,
            quantity: item.cantidad,
            price: item.price,
            subtotal: item.cantidad * item.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, supplier: true },
    });

    // Actualizar inventario de cada producto
    for (const item of productos) {
      await prisma.product.update({
        where: { id: item.productoId },
        data: { quantity: { increment: item.cantidad } },
      });
    }

    // Retornar la compra para el frontend
    res.status(201).json({
      id: purchase.id,
      proveedor: purchase.supplier.name,
      total: purchase.total,
      productos: purchase.items.map(i => ({
        producto: i.product.name,
        price: i.price,
        cantidad: i.quantity,
        subtotal: i.subtotal,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la compra y generar la factura' });
  }
});

// Obtener todas las compras
router.get('/', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { id: 'desc' },
    });

    // Cada compra con todos sus productos
    const compras = purchases.map(inv => ({
      id: inv.id,
      proveedor: inv.supplier.name,
      total: inv.total,
      productos: inv.items.map(item => ({
        producto: item.product.name,
        price: item.price,
        cantidad: item.quantity,
        subtotal: item.subtotal,
      })),
    }));

    res.json(compras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las compras' });
  }
});

// Eliminar compra (ya soporta multiples productos)
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });

    if (!purchase) {
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    // Revertir stock de cada producto
    for (const item of purchase.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    await prisma.purchase.delete({ where: { id: purchase.id } });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la compra" });
  }
});

module.exports = router;