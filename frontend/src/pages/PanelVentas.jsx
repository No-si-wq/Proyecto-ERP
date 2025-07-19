import React, { useEffect, useState } from "react";
import { Table, Typography, Button, Menu, Space, Tag, message } from "antd";
import {
  ReloadOutlined,
  HomeOutlined,
  FileAddOutlined,
  UserOutlined,
  ToolOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PanelVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ventas/admin");
      if (!res.ok) throw new Error("Error consultando ventas");
      const data = await res.json();
      setVentas(data);
    } catch (e) {
      message.error("No se pudieron cargar las ventas", e.message);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchVentas();
  }, []);

  const columns = [
    {
      title: "Folio",
      dataIndex: "folio",
      key: "folio",
      render: (f) => <Tag color="blue">{f}</Tag>,
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (fecha) =>
        fecha ? new Date(fecha).toLocaleString() : "Sin fecha",
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `$${Number(total).toFixed(2)}`,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) =>
        <Tag color={estado === "EMITIDA" ? "green" : "orange"}>{estado}</Tag>,
    },
  ];

  // Ribbon de acciones arriba
  const ribbon = (
    <Menu mode="horizontal" style={{ marginBottom: 8 }}>
      <Menu.Item key="recargar" icon={<ReloadOutlined />} onClick={fetchVentas}>
        Recargar
      </Menu.Item>
      <Menu.Item
        key="inicio"
        icon={<HomeOutlined />}
        onClick={() => navigate("/home")}
        style={{ float: "right" }}
      >
        Ir al inicio
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "32px auto",
        background: "#fff",
        borderRadius: 8,
        padding: 24,
        boxShadow: "0 2px 8px #d5deef",
        minHeight: "70vh"
      }}
    >
      {ribbon}
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Panel de Ventas
        </Title>
      </Space>
      <Table
        dataSource={ventas}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        scroll={{ x: true }}
      />
    </div>
  );
};

export default PanelVentas;