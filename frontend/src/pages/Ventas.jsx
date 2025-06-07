import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputNumber, message, Select, Input } from "antd";
import { useNavigate } from 'react-router-dom';

const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
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

  // Obtener clientes
  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch {
      message.error("No se pudieron cargar los clientes");
    }
  };

  // Obtener productos
  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos");
      const data = await res.json();
      setProductos(data);
    } catch {
      message.error("No se pudieron cargar los productos");
    }
  };

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchProductos();
  }, []);

  // Cuando cambia el producto o la cantidad, actualiza el precio y el total
  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.productoId) {
      const producto = productos.find(p => p.id === changedValues.productoId);
      if (producto) {
        form.setFieldsValue({
          price: producto.price,
          total: (allValues.cantidad || 1) * producto.price,
        });
      }
    }
    if (changedValues.cantidad || changedValues.price) {
      const cantidad = changedValues.cantidad ?? allValues.cantidad ?? 1;
      const price = changedValues.price ?? allValues.price ?? 0;
      form.setFieldsValue({
        total: cantidad * price,
      });
    }
  };

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
        <Form
          form={form}
          onFinish={onCreate}
          layout="vertical"
          onValuesChange={handleValuesChange}
          initialValues={{ cantidad: 1, price: 0, total: 0 }}
        >
          <Form.Item name="clienteId" label="Cliente" rules={[{ required: true }]}>
            <Select
              placeholder="Selecciona un cliente"
              options={clientes.map(c => ({
                label: c.name,
                value: c.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="productoId" label="Producto" rules={[{ required: true }]}>
            <Select
              placeholder="Selecciona un producto"
              options={productos.map(p => ({
                label: p.name,
                value: p.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="price" label="Precio del producto">
            <InputNumber style={{ width: "100%" }} disabled />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true, type: "number", min: 1 }]}>
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item name="total" label="Total" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Ventas;