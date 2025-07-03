import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { useNavigate } from 'react-router-dom';
import ClienteForm from "../components/ClienteForm";

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

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
    setConfirmLoading(true);
    try {
      await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Cliente creado");
      setModalVisible(false);
      fetchClientes();
    } catch {
      message.error("No se pudo crear el cliente");
    }
    setConfirmLoading(false);
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
      <ClienteForm
        visible={modalVisible}
        onCreate={onCreate}
        onCancel={() => setModalVisible(false)}
        confirmLoading={confirmLoading}
      />
    </div>
  );
};

export default Clientes;