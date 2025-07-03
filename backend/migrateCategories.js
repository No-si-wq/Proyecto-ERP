// migrateCategories.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Obtener todas las categorías únicas
  const products = await prisma.product.findMany();
  const categoryNames = [...new Set(products.map(p => p.category).filter(Boolean))];

  // 2. Crear categorías
  const categories = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    categories[name] = cat.id;
  }

  // 3. Actualizar productos
  for (const p of products) {
    if (p.category && categories[p.category]) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: categories[p.category] }
      });
    }
  }

  console.log("Migración completada");
}

main().catch(e => { console.error(e); process.exit(1); });