import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
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
};