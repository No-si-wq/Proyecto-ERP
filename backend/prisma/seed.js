// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { name: "Laptop", sku: "LP-001", price: 15000, quantity: 10 },
      { name: "Mouse", sku: "MS-002", price: 250, quantity: 50 }
    ]
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());