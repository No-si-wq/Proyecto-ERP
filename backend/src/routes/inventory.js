const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos con nombre de categoría
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.sku, p.quantity, p.price, p."categoryId", p.tax,
              c.id AS "cat_id", c.name AS "cat_name"
         FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
     ORDER BY p.id ASC`
    );
    // Mapear para incluir category como objeto
    const productos = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      quantity: row.quantity,
      price: row.price,
      categoryId: row.categoryId,
      tax: row.tax,
      category: row.cat_id ? { id: row.cat_id, name: row.cat_name } : null
    }));
    res.json(productos);
  } catch (err) {
    res.status(500).send('Error al obtener productos');
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  const { name, sku, quantity, price, categoryId, tax } = req.body;
  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !categoryId || !tax) {
    return res.status(400).send('Faltan campos obligatorios');
  }
  try {
    await db.query(
      'INSERT INTO "Product" (name, sku, quantity, price, "categoryId", tax) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, sku, quantity, price, categoryId, tax]
    );
    res.sendStatus(201);
  } catch (err) {
    if (err.code === '23505') { // Unique violation for sku
      res.status(409).send('El SKU ya existe');
    } else {
      res.status(500).send('Error al agregar producto');
    }
  }
});

// Editar producto existente
router.put('/:id', async (req, res) => {
  const { name, sku, quantity, price, categoryId, tax } = req.body;
  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !categoryId || !tax) {
    return res.status(400).send('Faltan campos obligatorios');
  }
  try {
    await db.query(
      'UPDATE "Product" SET name=$1, sku=$2, quantity=$3, price=$4, "categoryId"=$5, tax=$6 WHERE id=$7',
      [name, sku, quantity, price, categoryId, tax, req.params.id]
    );
    res.sendStatus(200);
  } catch (err) {
    if (err.code === '23505') { // Unique violation for sku
      res.status(409).send('El SKU ya existe');
    } else {
      res.status(500).send('Error al editar producto');
    }
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM "Product" WHERE id=$1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Error al eliminar producto'); 
  }
});

module.exports = router;