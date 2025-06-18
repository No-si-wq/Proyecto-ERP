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
  const { name, sku, quantity, price, category } = req.body;
  if (!name || !sku || typeof quantity !== 'number' || typeof price !== 'number') {
    return res.status(400).send('Faltan campos obligatorios');
  }
  try {
    await db.query(
      'INSERT INTO "Product" (name, sku, quantity, price, category) VALUES ($1, $2, $3, $4, $5)',
      [name, sku, quantity, price, category || null]
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