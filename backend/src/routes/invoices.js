  const express = require('express');
  const router = express.Router();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  router.get('/', async (req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        include: { items: { include: { product: true } }, client: true }
      });
      res.json(invoices);
    } catch (err) {
      res.status(500).send('Error al obtener ventas');
    }
  });
  // Registrar una venta (factura de venta)
    router.post('/venta', async (req, res) => {
    const { clientId, items } = req.body;
    console.log("POST /venta body:", req.body);

    try {
      // Validar stock para todos los items
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Stock insuficiente para el producto ${product.name}` });
        }
      }

      // Calcular total
      const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

      // Crear la factura con los items
      const invoice = await prisma.invoice.create({
        data: {
          clientId,
          items: {
            create: items.map(item => ({
              Name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            total,
          },
        },
        include: { items: true, client: true },
      });

      // Actualizar inventario
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      console.log("Venta registrada correctamente:", invoice);
      res.status(201).json(invoice); return;
    } catch (err) {
      console.error("Error al registrar la venta:", err);
      res.status(500).json({ error: 'Error al registrar la venta y generar la factura' }); return;
    }
  });


  module.exports = router;