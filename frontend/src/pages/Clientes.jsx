import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, InputNumber } from "antd";
import { useNavigate } from 'react-router-dom';

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch {
      message.error("Error al cargar clientes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const onCreate = async (values) => {
    try {
      await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Cliente creado");
      setModalVisible(false);
      form.resetFields();
      fetchClientes();
    } catch {
      message.error("No se pudo crear el cliente");
    }
  };

  const columns = [
    { title: "CodigoCliente", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "RTN", dataIndex: "rtn", key: "rtn" },
    { title: "Correo", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
    { title: "Dirección", dataIndex: "address", key: "address" },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <Button type="default" onClick={() => navigate('/home')} style={{ marginBottom: 16 }}>
        Ir al inicio
      </Button>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16, marginLeft: 8 }}>
        Nuevo Cliente
      </Button>
      <Table columns={columns} dataSource={clientes} loading={loading} rowKey="id" />
      <Modal
        title="Nuevo Cliente"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="rtn" label="RTN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Correo"><Input /></Form.Item>
          <Form.Item name="phone" label="Teléfono" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="Dirección" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clientes;