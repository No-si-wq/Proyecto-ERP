const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registrar una venta con múltiples productos
router.post('/', async (req, res) => {
  const { clienteId, productos } = req.body;
  try {
    // Validar productos y stock
    let total = 0;
    for (const p of productos) {
      const prod = await prisma.product.findUnique({ where: { id: p.productoId } });
      if (!prod) {
        return res.status(400).json({ error: `Producto con id ${p.productoId} no existe` });
      }
      if (prod.quantity < p.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ${prod.name}` });
      }
      total += p.cantidad * p.price;
    }

    // Crear la factura con todos los items
    const invoice = await prisma.invoice.create({
      data: {
        clientId: clienteId,
        total: total,
        items: {
          create: productos.map(p => ({
            productId: p.productoId,
            quantity: p.cantidad,
            price: p.price,
            subtotal: p.cantidad * p.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, client: true },
    });

    // Actualizar inventario
    for (const p of productos) {
      await prisma.product.update({
        where: { id: p.productoId },
        data: { quantity: { decrement: p.cantidad } },
      });
    }

    // Retornar la venta (puedes ajustar el formato según lo que necesites)
    res.status(201).json({
      id: invoice.id,
      cliente: invoice.client.name,
      items: invoice.items.map(item => ({
        producto: item.product.name,
        price: item.price,
        cantidad: item.quantity,
        subtotal: item.subtotal,
      })),
      total: invoice.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la venta y generar la factura' });
  }
});

// Obtener todas las ventas (con todos los productos)
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    // Puedes devolver un array de ventas, cada una con su array de productos:
    const ventas = invoices.map(inv => ({
      id: inv.id,
      cliente: inv.client.name,
      productos: inv.items.map(item => ({
        producto: item.product.name,
        price: item.price,
        cantidad: item.quantity,
        subtotal: item.subtotal,
      })),
      total: inv.total,
    }));

    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

// Eliminar venta (revertir stock de todos los productos)
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // Revertir stock de cada producto del item
    for (const item of invoice.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    await prisma.invoice.delete({ where: { id: invoice.id } });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la venta" });
  }
});

module.exports = router;