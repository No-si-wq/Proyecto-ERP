const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las compras
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Purchase"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error al obtener compras');
  }
});

// Registrar compra y actualizar inventario
router.post('/', async (req, res) => {
  const { proveedor, productoId, cantidad, total } = req.body;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO "Purchase" (proveedor, producto, cantidad, total) VALUES ($1, $2, $3, $4)',
      [proveedor, productoId, cantidad, total]
    );
    await client.query(
      'UPDATE "Product" SET cantidad = cantidad + $1 WHERE id = $2',
      [cantidad, productoId]
    );
    await client.query('COMMIT');
    res.sendStatus(201);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).send('Error al registrar compra');
  } finally {
    client.release();
  }
});

// Eliminar compra y restar stock (opcional)
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const compraRes = await db.query('SELECT producto, cantidad FROM "Purchase" WHERE id=$1', [id]);
  if (compraRes.rows.length === 0) return res.sendStatus(404);
  const { producto, cantidad } = compraRes.rows[0];
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM "Purchase" WHERE id=$1', [id]);
    await client.query('UPDATE "Product" SET cantidad = cantidad - $1 WHERE id = $2', [cantidad, producto]);
    await client.query('COMMIT');
    res.sendStatus(200);
  } catch {
    await client.query('ROLLBACK');
    res.status(500).send('Error al eliminar compra');
  } finally {
    client.release();
  }
});

module.exports = router;