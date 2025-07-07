const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper para generar folio con ceros a la izquierda
function generarFolio(id) {
  return String(id).padStart(5, '0');
}

// Obtener listado para Admin Ventas (todas las facturas/ventas)
router.get('/admin', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        // Puedes incluir más relaciones si lo necesitas
      },
      orderBy: { id: 'desc' },
    });

    // Devuelve solo los campos principales que necesitas para la tabla
    const result = invoices.map(inv => ({
      id: inv.id,
      folio: inv.folio,
      fecha: inv.createdAt,
      cliente: inv.client ? inv.client.name : "Sin cliente",
      total: inv.total,
      estado: inv.estado || "EMITIDA", // Si tienes campo estado
      // Otros campos que quieras mostrar, ejemplo:
      // vendedor: inv.vendedor, referencia: inv.referencia, etc.
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el listado de ventas" });
  }
});

// Endpoint para obtener el siguiente folio disponible
router.get('/next-folio', async (req, res) => {
  try {
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextNumber = (lastInvoice?.id ?? 0) + 1;
    const folio = generarFolio(nextNumber);
    res.json({ folio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el siguiente folio' });
  }
});

// Registrar una venta con múltiples productos
router.post('/', async (req, res) => {
  const { clienteId, productos, importeRecibido, cambio, formasPago } = req.body;
  try {
    // Validar productos y stock, obtener precios actuales
    let total = 0;
    const productosData = [];

    for (const p of productos) {
      const prod = await prisma.product.findUnique({ where: { id: p.productoId } });
      if (!prod) {
        return res.status(400).json({ error: `Producto con id ${p.productoId} no existe` });
      }
      if (prod.quantity < p.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ${prod.name}` });
      }
      const subtotal = p.cantidad * prod.price;
      total += subtotal;
      productosData.push({
        productId: p.productoId,
        quantity: p.cantidad,
        price: prod.price,
        subtotal
      });
    }

    // Obtener el siguiente folio correlativo
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextNumber = (lastInvoice?.id ?? 0) + 1;
    const folio = generarFolio(nextNumber);

    // Crear la factura con todos los items y los campos de pago, incluyendo el folio
    const invoice = await prisma.invoice.create({
      data: {
        folio,
        clientId: clienteId,
        total,
        importeRecibido: importeRecibido ?? null,
        cambio: cambio ?? null,
        formasPago: formasPago ? JSON.stringify(formasPago) : undefined,
        items: {
          create: productosData,
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

    // Retornar la venta (ajusta según lo que necesites)
    res.status(201).json({
      id: invoice.id,
      folio: invoice.folio,
      cliente: invoice.client.name,
      items: invoice.items.map(item => ({
        producto: item.product.name,
        price: item.price,
        cantidad: item.quantity,
        subtotal: item.subtotal,
      })),
      total: invoice.total,
      importeRecibido: invoice.importeRecibido,
      cambio: invoice.cambio,
      formasPago: invoice.formasPago ? JSON.parse(invoice.formasPago) : undefined,
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

    // Ahora incluye el folio en la respuesta
    const ventas = invoices.map(inv => ({
      id: inv.id,
      folio: inv.folio,
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