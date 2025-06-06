import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Obtener ventas desde el backend
  const fetchVentas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ventas");
      const data = await res.json();
      setVentas(data);
    } catch {
      message.error("Error al cargar ventas");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  // Crear nueva venta
const onCreate = async (values) => {
  try {
    await fetch("/api/Invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    message.success("Venta registrada");
    setModalVisible(false);
    form.resetFields();
    fetchVentas();
  } catch {
    message.error("No se pudo registrar la venta");
  }
};

  // Eliminar venta
  const onDelete = async (id) => {
    try {
      await fetch(`/api/ventas/${id}`, { method: "DELETE" });
      message.success("Venta eliminada");
      fetchVentas();
    } catch {
      message.error("No se pudo eliminar la venta");
    }
  };

  const columns = [
    { title: "Cliente", dataIndex: "cliente", key: "cliente" },
    { title: "Producto", dataIndex: "producto", key: "producto" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
    { title: "Total", dataIndex: "total", key: "total" },
    {
      title: "Acciones",
      render: (_, record) => (
        <Button danger onClick={() => onDelete(record.id)}>
          Eliminar
        </Button>
      ),
    },
  ];

  return (
     <div style={{
        minHeight: '100vh',
        minWidth: '100vw',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Registrar Venta
      </Button>
      <Table
        columns={columns}
        dataSource={ventas}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        pagination={{ pageSize: 8 }}
      />
      <Modal
        title="Registrar Venta"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="cliente" label="Cliente" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="producto" label="Producto" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true, type: "number", min: 1 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="total" label="Total" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Ventas;