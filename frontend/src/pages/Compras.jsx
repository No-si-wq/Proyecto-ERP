import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputNumber, message, Select } from "antd";

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form] = Form.useForm();

  // Obtener compras desde el backend
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

  // Obtener proveedores
  const fetchProveedores = async () => {
    try {
      const res = await fetch("/api/proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch {
      message.error("No se pudieron cargar los proveedores");
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
    fetchCompras();
    fetchProveedores();
    fetchProductos();
  }, []);

  // Autocompletar precio y total
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

  // Registrar nueva compra
  const onCreate = async (values) => {
    try {
      // El backend espera supplierId, productoId, cantidad, price, total
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

  // Eliminar compra
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
      height: '100%',
      width: '100%',
      background: 'linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 24,
    }}>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Registrar Compra
      </Button>
      <Table columns={columns} dataSource={compras} loading={loading} rowKey="id" />
      <Modal
        title="Registrar Compra"
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
          <Form.Item name="supplierId" label="Proveedor" rules={[{ required: true }]}>
            <Select
              placeholder="Selecciona un proveedor"
              options={proveedores.map(p => ({
                label: p.name,
                value: p.id,
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

export default Compras;