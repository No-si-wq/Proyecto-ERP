const express = require('express');
const pdfmake = require('pdfmake');
const { PrismaClient } = require('@prisma/client');

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
    bold: 'node_modules/pdfmake/fonts/Roboto-Medium.ttf',
    italics: 'node_modules/pdfmake/fonts/Roboto-Italic.ttf',
    bolditalics: 'node_modules/pdfmake/fonts/Roboto-MediumItalic.ttf'
  }
};

const router = express.Router();
const prisma = new PrismaClient();

router.get('/ventas', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ message: 'Debe especificar los parámetros from y to (YYYY-MM-DD)' });
  }

  try {
    const ventas = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to)
        }
      },
      include: {
        client: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const docDefinition = {
      content: [
        { text: `Reporte de Ventas (${from} a ${to})`, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: [50, 80, '*', '*', 100],
            body: [
              ['ID', 'Fecha', 'Cliente', 'RTN', 'Total'],
              ...ventas.map(v => [
                v.id,
                v.createdAt.toISOString().substring(0, 10),
                v.client?.name || '',
                v.client?.rtn || '',
                `$${v.total.toFixed(2)}`
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    const printer = new pdfmake(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${from}_a_${to}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
});

router.get('/compras', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ message: 'Debe especificar los parámetros from y to (YYYY-MM-DD)' });
  }

  try {
    const compras = await prisma.purchase.findMany({
      where: {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to)
        }
      },
      include: {
        supplier: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const docDefinition = {
      content: [
        { text: `Reporte de Compras (${from} a ${to})`, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: [50, 80, '*', '*', 100],
            body: [
              ['ID', 'Fecha', 'Proveedor', 'RTN', 'Total'],
              ...compras.map(c => [
                c.id,
                c.createdAt.toISOString().substring(0, 10),
                c.supplier?.name || '',
                c.supplier?.rtn || '',
                `$${c.total.toFixed(2)}`
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    const printer = new pdfmake(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_compras_${from}_a_${to}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
});

module.exports = router;