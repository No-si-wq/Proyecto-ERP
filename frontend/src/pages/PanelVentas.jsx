import React, { useEffect, useState } from "react";
import { Table, Typography, Button, Menu, Space, Tag, message, Popconfirm } from "antd";
import {
  ReloadOutlined,
  HomeOutlined,
  StopOutlined, // Importa el ícono
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PanelVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ventas/admin");
      if (!res.ok) throw new Error("Error consultando ventas");
        const data = await res.json();
        setVentas(data.ventas || data);
        setTotal(data.total || data.length);
    } catch (e) {
      message.error("No se pudieron cargar las ventas", e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  // Cancelar venta seleccionada
  const cancelarVenta = async () => {
    if (selectedRowKeys.length === 0) return;
    const venta = selectedRows[0];
    try {
      const res = await fetch(`/api/ventas/${venta.id}/cancel`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al cancelar la venta");
      message.success("Venta cancelada");
      setSelectedRowKeys([]); 
      setSelectedRows([]);
      fetchVentas();
    } catch (e) {
      message.error("No se pudo cancelar la venta", e.message);
    }
  };

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

  // Acción de cancelar arriba de la tabla
  const actionsBar = (
    <Space style={{ marginBottom: 16 }}>
      <Popconfirm
        title="¿Estás seguro de cancelar esta venta?"
        onConfirm={cancelarVenta}
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
          Panel de Ventas
        </Title>
        {actionsBar}
      </Space>
      <Table
        dataSource={ventas}
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

export default PanelVentas;