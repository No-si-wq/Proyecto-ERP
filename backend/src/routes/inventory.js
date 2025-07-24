const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos con nombre de categoría y detalle de impuesto
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.sku, p.quantity, p.price, p."categoryId", p."taxId",
       c.id AS "cat_id", c.name AS "cat_name",
       t.id AS "tax_id", t.clave AS "tax_clave", t.descripcion AS "tax_desc", t.percent AS "tax_percent"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "Tax" t ON p."taxId" = t.id
      ORDER BY p.id ASC`
    );

    const productos = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      quantity: row.quantity,
      price: row.price,
      categoryId: row.categoryId,
      taxId: row.tax_id,
      category: row.cat_id ? { id: row.cat_id, name: row.cat_name } : null,
      tax: row.tax_id ? {
        id: row.tax_id,
        clave: row.tax_clave,
        descripcion: row.tax_desc,
        percent: row.tax_percent
      } : null
    }));

    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});



// Crear nuevo producto
router.post('/', async (req, res) => {
  const { name, sku, quantity, price, categoryId, taxId } = req.body;
  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !categoryId || !taxId) {
    return res.status(400).send('Faltan campos obligatorios');
  }

  try {
    // Insertar producto
    const insertResult = await db.query(
      'INSERT INTO "Product" (name, sku, quantity, price, "categoryId", "taxId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, sku, quantity, price, categoryId, taxId]
    );

    const newProductId = insertResult.rows[0].id;

    // Obtener producto completo con joins
    const result = await db.query(
      `SELECT p.id, p.name, p.sku, p.quantity, p.price, p."categoryId", p."taxId",
              c.id AS "cat_id", c.name AS "cat_name",
              t.id AS "tax_id", t.clave AS "tax_clave", t.descripcion AS "tax_desc", t.percent AS "tax_percent"
         FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    LEFT JOIN "Tax" t ON p."taxId" = t.id
        WHERE p.id = $1`,
      [newProductId]
    );

    const row = result.rows[0];
    const producto = {
      id: row.id,
      name: row.name,
      sku: row.sku,
      quantity: row.quantity,
      price: row.price,
      categoryId: row.categoryId,
      taxId: row.tax_id,
      category: row.cat_id ? { id: row.cat_id, name: row.cat_name } : null,
      tax: row.tax_id ? {
        id: row.tax_id,
        clave: row.tax_clave,
        descripcion: row.tax_desc,
        percent: row.tax_percent
      } : null
    };

    res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(409).send('El SKU ya existe');
    } else {
      res.status(500).send('Error al agregar producto');
    }
  }
});


// Editar producto existente
router.put('/:id', async (req, res) => {
  const { name, sku, quantity, price, categoryId, taxId } = req.body;
  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number' || !categoryId || !taxId) {
    return res.status(400).send('Faltan campos obligatorios');
  }
  try {
    await db.query(
    'UPDATE "Product" SET name=$1, sku=$2, quantity=$3, price=$4, "categoryId"=$5, "taxId"=$6 WHERE id=$7',
    [name, sku, quantity, price, categoryId, taxId, req.params.id]
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