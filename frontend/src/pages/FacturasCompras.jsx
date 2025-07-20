import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Space, Menu, message } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const FacturasCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCompras = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/compras/admin");
      if (!res.ok) throw new Error("Error consultando ventas");
      const data = await res.json();
      setCompras(data);
    } catch (e) {
      message.error("No se pudieron cargar las compras", e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompras();
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
      title: "Proveedor",
      dataIndex: "proveedor",
      key: "proveedor",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `L. ${Number(total).toFixed(2)}`,
    },
  ];

  const ribbon = (
    <Menu mode="horizontal" style={{ marginBottom: 8 }}>
      <Menu.Item key="recargar" icon={<ReloadOutlined />} onClick={fetchCompras}>
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
          Facturas de Compras
        </Title>
      </Space>
      <Table
        dataSource={compras}
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

export default FacturasCompras;