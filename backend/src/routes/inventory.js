const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Product"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error al obtener productos');
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  const { nombre, cantidad, precio } = req.body;
  try {
    await db.query(
      'INSERT INTO "Product" (nombre, cantidad, precio) VALUES ($1, $2, $3)',
      [nombre, cantidad, precio]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send('Error al agregar producto');
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