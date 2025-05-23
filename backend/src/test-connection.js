// erp-backend/src/test-connection.js
import prisma from './db.js';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log(' Conexión exitosa a PostgreSQL');
    const users = await prisma.user.findMany();
    console.log('Usuarios:', users);
  } catch (error) {
    console.error(' Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();