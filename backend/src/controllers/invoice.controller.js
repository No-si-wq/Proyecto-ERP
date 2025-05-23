export const createInvoice = async (req, res) => {
  try {
    const result = await prisma.$transaction([
      prisma.invoice.create({
        data: {
          clientId: req.body.clientId,
          total: calcularTotal(req.body.items),
          items: req.body.items
        }
      }),
      ...req.body.items.map(item => 
        prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        })
      )
    ]);
    
    generarPDF(result[0]); // Genera factura en PDF
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(400).json({ error: 'Error en transacción' });
  }
};