const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Product" ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error al obtener productos');
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  const { clienteId, productoId, cantidad, price } = req.body;
  try {
    // Validar cliente
    const client = await prisma.client.findUnique({ where: { id: clienteId } });
    if (!client) {
      return res.status(400).json({ error: `Cliente con id ${clienteId} no existe` });
    }

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
      include: { items: true, client: true },
    });

    // Actualizar inventario
    await prisma.product.update({
      where: { id: productoId },
      data: { quantity: { decrement: cantidad } },
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar la venta y generar la factura' });
  }
});

module.exports = router;