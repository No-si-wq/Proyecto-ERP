import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchCompras = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Purchase");
      const data = await res.json();
      setCompras(data);
    } catch {
      message.error("Error al cargar compras");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  const onCreate = async (values) => {
    try {
      await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Compra registrada");
      setModalVisible(false);
      form.resetFields();
      fetchCompras();
    } catch {
      message.error("No se pudo registrar la compra");
    }
  };

  const onDelete = async (id) => {
    try {
      await fetch(`/api/compras/${id}`, { method: "DELETE" });
      message.success("Compra eliminada");
      fetchCompras();
    } catch {
      message.error("No se pudo eliminar la compra");
    }
  };

  const columns = [
    { title: "Proveedor", dataIndex: "proveedor", key: "proveedor" },
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
        Registrar Compra
      </Button>
      <Table columns={columns} dataSource={compras} loading={loading} rowKey="id" />
      <Modal
        title="Registrar Compra"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="proveedor" label="Proveedor" rules={[{ required: true }]}>
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

export default Compras;