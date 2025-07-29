const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      }, orderBy: { id: 'asc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario
router.post('/', async (req, res) => {
  const { email, username, password, role } = req.body;
  if (!email || !username || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
      }
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'El email o usuario ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
});

router.put('/:id', async (req, res) => {
  const { email, username, password, role } = req.body;
  const userId = Number(req.params.id);

  if (!email && !username && !password && !role) {
    return res.status(400).json({ error: 'Debes proporcionar al menos un campo para actualizar' });
  }

  try {
    const dataToUpdate = {
      ...(email && { email }),
      ...(username && { username }),
      ...(role && { role }),
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else if (err.code === 'P2002') {
      res.status(409).json({ error: 'El email o usuario ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: Number(req.params.id) }
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
