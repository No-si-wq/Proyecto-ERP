const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las tiendas con cajas e inventario
router.get('/', async (req, res) => {
  try {
    const tiendas = await prisma.store.findMany({
      include: {
        cajas: {
          select: {
            id: true,
            numeroDeCaja: true,
            descripcion: true,
            formatoNota: true,
            formatoCFDI: true
          }
        },
        inventario: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.json(tiendas);
  } catch (err) {
    console.error('Error al obtener tiendas:', err);
    res.status(500).send('Error al obtener tiendas');
  }
});

// Crear nueva tienda
router.post('/', async (req, res) => {
  const { clave, nombre, direccion, telefono } = req.body;

  if (!clave || !nombre || !direccion || !telefono) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const nuevaTienda = await prisma.store.create({
      data: {
        clave,
        nombre,
        direccion,
        telefono
      }
    });

    res.status(201).json(nuevaTienda);
  } catch (err) {
    console.error('Error al crear tienda:', err);
    res.status(500).send('Error al crear tienda');
  }
});

// Editar tienda
router.put('/:id', async (req, res) => {
  const tiendaId = parseInt(req.params.id, 10);
  const { clave, nombre, direccion, telefono } = req.body;

  if (!clave || !nombre || !direccion || !telefono) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    const tiendaActualizada = await prisma.store.update({
      where: { id: tiendaId },
      data: {
        clave,
        nombre,
        direccion,
        telefono
      }
    });

    res.status(200).json(tiendaActualizada);
  } catch (err) {
    console.error('Error al editar tienda:', err);
    res.status(500).send('Error al actualizar tienda');
  }
});

// Eliminar tienda (solo si no tiene cajas ni inventario)
router.delete('/:id', async (req, res) => {
  const tiendaId = parseInt(req.params.id, 10);

  try {
    const cajas = await prisma.cashRegister.count({
      where: { storeId: tiendaId }
    });

    const inventario = await prisma.product.count({
      where: { storeId: tiendaId }
    });

    if (cajas > 0 || inventario > 0) {
      return res.status(400).send('No se puede eliminar una tienda con cajas o inventario.');
    }

    await prisma.store.delete({
      where: { id: tiendaId }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('Error al eliminar tienda:', err);
    res.status(500).send('Error al eliminar tienda');
  }
});

module.exports = router;