  const express = require('express');
  const router = express.Router();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Registrar una compra (factura de compra)
  router.post('/', async (req, res) => {
    const { supplierId, productoId, cantidad, price } = req.body;
    try {
      const total = cantidad * price;

      // Crear la factura con un solo item
      const purchase = await prisma.purchase.create({
        data: {
          supplierId: supplierId,
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
        include: { items: { include: { product: true } }, supplier: true },
      });

      // Actualizar inventario
      await prisma.product.update({
        where: { id: productoId },
        data: { quantity: { increment: cantidad } },
      });

      // Retornar la venta en formato compatible con el frontend
      res.status(201).json({
        id: purchase.id,
        proveedor: purchase.supplier.name,
        producto: purchase.items[0].product.name,
        price: purchase.items[0].price,
        cantidad: purchase.items[0].quantity,
        total: purchase.total,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al registrar la venta y generar la factura' });
    }
  });

  // Obtener todas las ventas en formato para tabla del frontend
  router.get('/', async (req, res) => {
    try {
      const purchase = await prisma.purchase.findMany({
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      // Transformar datos: una fila por factura (asumiendo solo un producto por factura)
      const compras = purchase.map(inv => {
        const item = inv.items[0]; // solo uno por venta en este diseño
        return {
          id: inv.id,
          proveedor: inv.supplier.name,
          producto: item?.product?.name || "",
          price: item?.price || 0,
          cantidad: item?.quantity || 0,
          total: inv.total,
        };
      });

      res.json(compras);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener las compras' });
    }
  });

  // Eliminar venta
  router.delete('/:id', async (req, res) => {
    try {
      // Obtener la venta y los items para revertir stock
      const purchase = await prisma.purchase.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { items: true }
      });

      if (!purchase) {
        return res.status(404).json({ error: "Venta no encontrada" });
      }

      // Revertir stock de cada producto del item
      for (const item of purchase.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Eliminar la venta
      await prisma.purchase.delete({ where: { id: purchase.id } });

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar la compra" });
    }
  });

  module.exports = router;