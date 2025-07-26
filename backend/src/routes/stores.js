const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/next-clave', async (req, res) => {
  try {
    console.log('Petición recibida a /next-clave');
    const existing = await prisma.store.findMany({ select: { clave: true } });
    console.log('Claves existentes:', existing);

    const existingNumbers = new Set(
      existing
        .map(pm => parseInt(pm.clave))
        .filter(n => !isNaN(n))
    );

    let next = 1;
    while (existingNumbers.has(next)) {
      next++;
    }

    const clave = next.toString().padStart(2, '0');
    console.log('Clave siguiente generada:', clave);
    res.json({ clave });
  } catch (err) {
    console.error('Error en /next-clave:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verificar si una clave ya existe
router.get('/check-clave/:clave', async (req, res) => {
  const { clave } = req.params;

  try {
    const exists = await prisma.store.findFirst({
      where: { clave: clave }
    });

    res.json({ exists: !!exists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar la clave' });
  }
});

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

// Obtener tienda por ID
router.get('/:id', async (req, res) => {
  const tiendaId = parseInt(req.params.id, 10);
  if (isNaN(tiendaId)) {
    return res.status(400).send("ID inválido");
  }

  try {
    const tienda = await prisma.store.findUnique({
      where: { id: tiendaId }
    });

    if (!tienda) {
      return res.status(404).send('Tienda no encontrada');
    }

    res.json(tienda);
  } catch (err) {
    console.error('Error al obtener tienda:', err);
    res.status(500).send('Error al obtener tienda');
  }
});

// Editar tienda
router.put('/:id', async (req, res) => {
  const tiendaId = parseInt(req.params.id, 10);
  if (isNaN(tiendaId)) {
    return res.status(400).send("ID inválido");
  }
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
  const storeId = parseInt(req.params.id);
  try {
    const tienda = await prisma.store.findUnique({ where: { id: storeId } });

    if (!tienda) {
      return res.status(404).send('La tienda no existe');
    }

    // Verificar si tiene relaciones activas
    const tieneInventario = await prisma.product.findFirst({
      where: { storeId },
    });

    const tieneCajas = await prisma.cashRegister.findFirst({
      where: { storeId },
    });

    if (tieneInventario || tieneCajas) {
      return res
        .status(400)
        .send('No se puede eliminar una tienda con cajas o inventario.');
    }

    await prisma.store.delete({ where: { id: storeId } });

    return res.status(200).send('Tienda eliminada exitosamente');
  } catch (error) {
    console.error('Error al eliminar tienda:', error);
    return res.status(500).send('Error interno al eliminar la tienda');
  }
});

module.exports = router;