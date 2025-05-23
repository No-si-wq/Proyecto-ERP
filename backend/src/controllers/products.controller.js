import prisma from '../db.js';

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, quantity } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, price, quantity }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};