import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, Space, Menu, message, Button, Popconfirm } from "antd";
import { ReloadOutlined, HomeOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const FacturasCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const rowSelection = {
    type: 'radio', // o 'checkbox' si quieres selección múltiple
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    getCheckboxProps: record => ({
      disabled: record.estado === "CANCELADA"
    }),
  };


  const fetchCompras = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/compras/admin");
      if (!res.ok) throw new Error("Error consultando compras");
        const data = await res.json();
        setCompras(data.ventas || data);
        setTotal(data.total || data.length);
    } catch (e) {
      message.error("No se pudieron cargar las compras", e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  // Cancelar compra seleccionada
  const cancelarCompra = async () => {
    if (selectedRowKeys.length === 0) return;
    const compra = selectedRows[0];
    try {
      const res = await fetch(`/api/compras/${compra.id}/cancel`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al cancelar la compra");
      message.success("Compra cancelada");
      setSelectedRowKeys([]); 
      setSelectedRows([]);
      fetchCompras();
    } catch (e) {
      message.error("No se pudo cancelar la compra", e.message);
    }
  };

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
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) =>
        <Tag color={estado === "CANCELADA" ? "red" : "green"}>
          {estado}
        </Tag>,
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

  const actionsBar = (
    <Space style={{ marginBottom: 16 }}>
      <Popconfirm
        title="¿Estás seguro de cancelar esta compra?"
        onConfirm={cancelarCompra}
        okText="Sí, cancelar"
        cancelText="No"
      >
        <Button
          danger
          icon={<StopOutlined />}
          disabled={selectedRows.length === 0}
        >
          Cancelar
        </Button>
      </Popconfirm>
      <Button
        type="primary"
        onClick={() => navigate(`/ventas?id=${selectedRows[0]?.id}`)}
        disabled={selectedRows.length === 0}
      >
        Editar
      </Button>
    </Space>
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
        {actionsBar}
      </Space>
      <Table
        dataSource={compras}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: 10, total, onChange: setPage }}
        bordered
        scroll={{ x: true }}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default FacturasCompras;