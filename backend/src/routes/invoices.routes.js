// routes/invoices.js
router.post('/', authMiddleware, async (req, res) => {
  const { client, items } = req.body;
  
  // Calcular total y actualizar inventario
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Crear transacción para actualizar inventario
  const invoice = await prisma.$transaction([
    prisma.invoice.create({
      data: { client, total, items }
    }),
    ...items.map(item => 
      prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } }
      })
    )
  ]);

  res.json(invoice);
});