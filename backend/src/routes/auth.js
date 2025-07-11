const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Exporta una función que recibe el pool de PostgreSQL
module.exports = (pool) => {
  const router = express.Router();

  // Validar token
  router.get('/validate', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ valid: false, message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false, message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, userId: decoded.userId, username: decoded.username });
    } catch (err) {
      res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
    }
  });

  // Registro
  router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const allowedRoles = ['ventas', 'facturacion', 'admin', 'contabilidad'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    try {
      // Verifica si el usuario o correo ya existe
      const userExists = await pool.query(
        'SELECT 1 FROM "User" WHERE email = $1 OR username = $2',
        [email, username]
      );
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'El usuario o correo ya existe' });
      }

      // Hashea la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdAt = new Date();

      // Inserta el usuario
      await pool.query(
        'INSERT INTO "User" (email, password, role, "createdAt", username) VALUES ($1, $2, $3, $4, $5)',
        [email, hashedPassword, role, createdAt, username]
      );

      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al registrar el usuario' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.query(
        'SELECT * FROM "User" WHERE username = $1',
        [username]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
      const user = result.rows[0];

      // Compara la contraseña
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }

      // Genera un token JWT
      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({ token, username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  });

  return router;
};