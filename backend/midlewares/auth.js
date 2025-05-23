import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { userId: 1, role: 'ADMIN', ... }
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido" });
  }
};