  const express = require('express');
  const router = express.Router();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Registrar una venta (factura de venta)
  router.post('/', async (req, res) => {
    const { clienteId, productoId, cantidad, price } = req.body;
    try {
          // Validar producto y stock
          const product = await prisma.product.findUnique({ where: { id: productoId } });
          if (!product) {
            return res.status(400).json({ error: `Producto con id ${productoId} no existe` });
          }
          if (product.quantity < cantidad) {
            return res.status(400).json({ error: `Stock insuficiente para el producto ${product.name}` });
          }

      const total = cantidad * price;

      // Crear la factura con un solo item
      const invoice = await prisma.invoice.create({
        data: {
          clientId: clienteId,
          total: total,
          items: {
            create: [{
              productId: productoId,
              quantity: cantidad,
              price: price,
              subtotal: cantidad * price,
            }],
          },
        },
        include: { items: { include: { product: true } }, client: true },
      });

      // Actualizar inventario
      await prisma.product.update({
        where: { id: productoId },
        data: { quantity: { decrement: cantidad } },
      });

      // Retornar la venta en formato compatible con el frontend
      res.status(201).json({
        id: invoice.id,
        cliente: invoice.client.name,
        producto: invoice.items[0].product.name,
        price: invoice.items[0].price,
        cantidad: invoice.items[0].quantity,
        total: invoice.total,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al registrar la venta y generar la factura' });
    }
  });

  // Obtener todas las ventas en formato para tabla del frontend
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

      // Transformar datos: una fila por factura (asumiendo solo un producto por factura)
      const ventas = invoices.map(inv => {
        const item = inv.items[0]; // solo uno por venta en este diseño
        return {
          id: inv.id,
          cliente: inv.client.name,
          producto: item?.product?.name || "",
          price: item?.price || 0,
          cantidad: item?.quantity || 0,
          total: inv.total,
        };
      });

      res.json(ventas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener las ventas' });
    }
  });

  // Eliminar venta
  router.delete('/:id', async (req, res) => {
    try {
      // Obtener la venta y los items para revertir stock
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

      // Eliminar la venta
      await prisma.invoice.delete({ where: { id: invoice.id } });

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar la venta" });
    }
  });

  module.exports = router;