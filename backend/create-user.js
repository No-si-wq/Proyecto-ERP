require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de la conexión
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function crearUsuario() {
  const username = 'admin';
  const email = 'admin@ejemplo.com';
  const password = '1234';
  const role = 'admin';
  const createdAt = new Date();

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO "User" (username, email, password, role, "createdAt") VALUES ($1, $2, $3, $4, $5)',
    [username, email, hash, role, createdAt]
  );
  console.log('Usuario creado o ya existente');
  process.exit();
}

crearUsuario().catch(console.error);