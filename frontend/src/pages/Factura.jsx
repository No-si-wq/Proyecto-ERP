import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Typography } from "antd";

const { Title, Text } = Typography;

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [visible, setVisible] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const fetchFacturas = async () => {
    const res = await fetch("/api/invoices");
    const data = await res.json();
    setFacturas(data);
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Cliente", dataIndex: "client" },
    { title: "Tipo", dataIndex: "type", render: t => t === "COMPRA" ? "Compra" : "Venta" },
    { title: "Total", dataIndex: "total", render: t => `$${t.toFixed(2)}` },
    { title: "Fecha", dataIndex: "createdAt", render: f => (new Date(f)).toLocaleString() },
    {
      title: "Acciones",
      render: (_, factura) => (
        <Button type="link" onClick={() => { setFacturaSeleccionada(factura); setVisible(true); }}>
          Ver detalles
        </Button>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '100vh', width: '100%', margin: "0 auto", padding: 24 }}>
      <Title level={2}>Documentos</Title>
      <Table 
        columns={columns}
        dataSource={facturas}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={700}
        title={`Factura #${facturaSeleccionada?.id ?? ""}`}
      >
        {facturaSeleccionada ? (
          <>
            <Text strong>Cliente/Proveedor:</Text> {facturaSeleccionada.client} <br />
            <Text strong>Tipo:</Text> {facturaSeleccionada.type === "COMPRA" ? "Compra" : "Venta"}<br/>
            <Text strong>Fecha:</Text> {(new Date(facturaSeleccionada.createdAt)).toLocaleString()}<br/>
            <Text strong>Total:</Text> ${facturaSeleccionada.total.toFixed(2)}<br/>
            <br/>
            <Table
              size="small"
              bordered
              pagination={false}
              columns={[
                { title: "Producto", dataIndex: ["product", "name"] },
                { title: "Cantidad", dataIndex: "quantity" },
                { title: "Precio Unitario", dataIndex: "price", render: p => `$${p.toFixed(2)}` },
                { title: "Subtotal", dataIndex: "subtotal", render: s => `$${s.toFixed(2)}` },
              ]}
              dataSource={facturaSeleccionada.items.map((item, idx) => ({ ...item, key: idx }))}
            />
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default Facturas;