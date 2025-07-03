const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Importa el router de auth y pásale el pool
const authRouter = require('./routes/auth')(pool);
const categoriesRoutes = require('./routes/categories');
app.use('/api/auth', authRouter);
app.use('/api/clientes', require('./routes/clients'));
app.use('/api/proveedores', require('./routes/suppliers'));
app.use('/api/ventas', require('./routes/invoices'));
app.use('/api/compras', require('./routes/purchase'));
app.use('/api/inventario', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/categorias', categoriesRoutes);

module.exports = app;