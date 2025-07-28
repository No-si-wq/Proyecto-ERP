const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/productos/tienda/:storeId
router.get("/tienda/:storeId", async (req, res) => {
  const { storeId } = req.params;

  try {
    const productos = await prisma.product.findMany({
      where: { storeId: Number(storeId) },
      include: {
        category: true,
        tax: true,
        store: true,
      },
    });

    // Mapear el campo 'nombre' a 'name' dentro del objeto store para el frontend
    const productosTransformados = productos.map((producto) => ({
      ...producto,
      store: {
        ...producto.store,
        name: producto.store.nombre, // Mapeo aquí
      },
    }));

    res.json(productosTransformados);
  } catch (error) {
    console.error("Error cargando productos:", error);
    res.status(500).json({ error: "Error al cargar productos" });
  }
});

module.exports = router;