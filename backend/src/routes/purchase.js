const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper para generar folio con ceros a la izquierda
function generarFolioCompra(id) {
  return String(id).padStart(5, '0');
}

// Obtener listado para Admin Ventas (todas las facturas/ventas)
router.get('/admin', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true,
      },
      orderBy: { id: 'asc' },
    });

    // Aquí asegúrate de que inv.folio esté correctamente incluido
    const result = purchases.map(pur => ({
      id: pur.id,
      folio: pur.folio || "-", // Si no existe, pon "-"
      fecha: pur.createdAt,
      proveedor: pur.supplier ? pur.supplier.name : "Sin proveedor",
      total: pur.total,
      estado: pur.estado || "EMITIDA",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el listado de ventas" });
  }
});

// Registrar una compra (factura de compra) con múltiples productos
router.post('/', async (req, res) => {
  const { supplierId, productos, storeId, cajaId } = req.body; 

  if (!storeId || !cajaId) {
    return res.status(400).json({ error: "Faltan storeId o cajaId" });
  }

  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'La compra debe tener al menos un producto' });
    }

    // Calcular el total general
    const total = productos.reduce((acc, item) => acc + item.cantidad * item.price, 0);

    // Obtener el siguiente folio correlativo
    const lastPurchase = await prisma.purchase.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextNumber = (lastPurchase?.id ?? 0) + 1;
    const folio = generarFolioCompra(nextNumber);

    // Crear la compra con folio y varios items
    const purchase = await prisma.purchase.create({
      data: {
        folio,
        supplier: {connect: { id: supplierId }},
        total: total,
        caja: {
          connect: { id: cajaId }
        },
        store: {
          connect: { id: storeId }
        },
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
      folio: purchase.folio,
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

// Obtener el siguiente folio disponible para compras
router.get('/next-folio', async (req, res) => {
  try {
    const lastPurchase = await prisma.purchase.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextNumber = (lastPurchase?.id ?? 0) + 1;
    const folio = String(nextNumber).padStart(5, '0');
    res.json({ folio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el siguiente folio de compra' });
  }
});

// Cancelar compra (soft delete)
router.patch('/:id/cancel', async (req, res) => {
  try {
    const compra = await prisma.purchase.update({
      where: { id: parseInt(req.params.id) },
      data: { estado: "CANCELADA" }
    });
    res.json(compra);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cancelar la compra" });
  }
});

module.exports = router;