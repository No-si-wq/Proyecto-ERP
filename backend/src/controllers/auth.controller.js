const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

dotenv.config();

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Validar usuario en la base de datos
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  // 2. Generar token JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token });
  module.exports = login;
};