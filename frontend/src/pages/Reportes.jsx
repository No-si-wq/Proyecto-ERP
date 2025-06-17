import React, { useState } from "react";
import { DatePicker, Button, Card, Typography, message, Space, Table, Tag } from "antd";
import dayjs from "dayjs";

const hoy = dayjs(); // Fecha y hora actual
console.log(hoy.format("YYYY-MM-DD")); // Muestra la fecha en formato año-mes-día
const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function Reportes() {
  const [dates, setDates] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [ganancias, setGanancias] = useState(null);
  const [loadingDatos, setLoadingDatos] = useState(false);

  const columnsVentas = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Fecha", dataIndex: "createdAt", key: "createdAt", render: t => t.substring(0,10) },
    { title: "Cliente", dataIndex: ["client", "name"], key: "cliente" },
    { title: "RTN", dataIndex: ["client", "rtn"], key: "rtn" },
    { title: "Total", dataIndex: "total", key: "total", render: t => `$${t.toFixed(2)}` }
  ];

  const columnsCompras = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Fecha", dataIndex: "createdAt", key: "createdAt", render: t => t.substring(0,10) },
    { title: "Proveedor", dataIndex: ["supplier", "name"], key: "proveedor" },
    { title: "RTN", dataIndex: ["supplier", "rtn"], key: "rtn" },
    { title: "Total", dataIndex: "total", key: "total", render: t => `$${t.toFixed(2)}` }
  ];

  const consultarDatos = async () => {
    if (!dates || dates.length < 2) {
      message.warning("Selecciona un rango de fechas");
      return;
    }
    setLoadingDatos(true);
    const from = dates[0].format("YYYY-MM-DD");
    const to = dates[1].format("YYYY-MM-DD");
    try {
      // Obtener ventas y compras
      const datosRes = await fetch(`/api/reports/datos?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const datos = await datosRes.json();
      setVentas(datos.ventas || []);
      setCompras(datos.compras || []);
      // Obtener ganancias
      const gananciasRes = await fetch(`/api/reports/ganancias?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const gananciasData = await gananciasRes.json();
      setGanancias(gananciasData);
    } catch {
      message.error("Error al obtener los datos");
    }
    setLoadingDatos(false);
  };

  return (
    <Card>
      <Title level={2}>Reportes de Compras y Ventas</Title>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          onChange={setDates}
          format="YYYY-MM-DD"
          allowClear
        />
        <Button type="primary" onClick={consultarDatos} loading={loadingDatos}>
          Consultar
        </Button>
      </Space>
      <Card title="Ventas" style={{ marginTop: 24 }}>
        <Table dataSource={ventas} columns={columnsVentas} rowKey="id" pagination={false} />
      </Card>
      <Card title="Compras" style={{ marginTop: 24 }}>
        <Table dataSource={compras} columns={columnsCompras} rowKey="id" pagination={false} />
      </Card>
      {ganancias && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>
            Total Ventas: <span style={{ color: "#389e0d" }}>${ganancias.totalVentas?.toFixed(2) ?? "0.00"}</span>
            <br />
            Total Compras: <span style={{ color: "#cf1322" }}>${ganancias.totalCompras?.toFixed(2) ?? "0.00"}</span>
            <br />
            <Tag color={ganancias.ganancia >= 0 ? "green" : "red"}>
              {ganancias.status}: ${ganancias.ganancia?.toFixed(2) ?? "0.00"}
            </Tag>
          </Title>
        </Card>
      )}
    </Card>
  );
}