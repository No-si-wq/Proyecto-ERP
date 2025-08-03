const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = () => {
  const router = express.Router();

  // Validar token
  router.get('/validate', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ valid: false, message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false, message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, userId: decoded.userId, username: decoded.username, role: decoded.role });
    } catch (err) {
      res.status(401).json({ valid: false, message: 'Token inválido o expirado' });
    }
  });

// POST /register
  router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validar formato de email simple (puedes usar "validator" si prefieres)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email no válido' });
    }

    // Validar rol permitido
    const allowedRoles = ['ventas', 'facturacion', 'admin', 'contabilidad'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    try {
      // Verificar si ya existe usuario con mismo email o username
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'El usuario o correo ya existe' });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario
      await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role,
          createdAt: new Date(),
        }
      });

      res.status(201).json({ message: 'Usuario registrado exitosamente' });

    } catch (err) {
      console.error('Error en /register:', err);
      res.status(500).json({ message: 'Error interno al registrar el usuario' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const users = await prisma.user.findMany({
        where: { username },
        orderBy: { createdAt: 'asc' } // opcional: usa el más reciente
      });

      if (users.length === 0) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }

      // Recorremos los posibles usuarios
      let validUser = null;
      for (const u of users) {
        const match = await bcrypt.compare(password, u.password);
        if (match) {
          validUser = u;
          break;
        }
      }

      if (!validUser) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }

    const token = jwt.sign(
      {
        userId: validUser.id,
        username: validUser.username,
        role: validUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Además, puedes devolver también el rol al frontend
    res.json({
      token, username: validUser.username, role: validUser.role});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  });

  return router;
};
