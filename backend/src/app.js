const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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


app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clients'));
app.use('/api/proveedores', require('./routes/supplier'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/purchase', require('./routes/purchase'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/report.routes'));

module.exports = app;