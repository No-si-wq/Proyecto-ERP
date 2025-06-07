import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function generarFacturaPDF({ client, items, total }) {
  const docDefinition = {
    content: [
      { text: 'Factura', style: 'header' },
      `Cliente: ${client}`,
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            ['Producto', 'Cantidad', 'Precio', 'Subtotal'],
            ...items.map(item => [
              item.name,
              item.quantity,
              item.price,
              item.subtotal,
            ]),
            [{ text: 'Total', colSpan: 3 }, {}, {}, total]
          ],
        }
      }
    ]
  };
  pdfMake.createPdf(docDefinition).download('factura.pdf');
}