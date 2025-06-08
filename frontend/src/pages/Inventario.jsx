import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import { useNavigate } from 'react-router-dom';

const Inventario = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setProductos(data);
    } catch {
      message.error("Error al cargar el inventario");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const onCreate = async (values) => {
    try {
      await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Producto añadido");
      setModalVisible(false);
      form.resetFields();
      fetchProductos();
    } catch {
      message.error("No se pudo añadir el producto");
    }
  };

  const onDelete = async (id) => {
    try {
      await fetch(`/api/inventario/${id}`, { method: "DELETE" });
      message.success("Producto eliminado");
      fetchProductos();
    } catch {
      message.error("No se pudo eliminar el producto");
    }
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    { title: "Precio", dataIndex: "price", key: "price", render: (value) => `$${value.toFixed(2)}` },
    { title: "Categoría", dataIndex: "category", key: "category" },
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
        width: '100%',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
      }}>
      <Button type="default" onClick={() => navigate('/home')} style={{ marginBottom: 16 }}>
        Ir al inicio
      </Button>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Añadir Producto
      </Button>
      <Table columns={columns} dataSource={productos} loading={loading} rowKey="id" />
      <Modal
        title="Añadir Producto"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre del producto' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU (código único)" rules={[{ required: true, message: 'Ingrese el SKU (código único)' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="Cantidad" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Precio" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} step={0.01} />
          </Form.Item>
          <Form.Item name="category" label="Categoría" rules={[]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventario;