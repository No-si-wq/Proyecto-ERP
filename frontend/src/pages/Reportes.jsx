import React, { useState } from "react";
import { DatePicker, Button, Card, Typography, message, Space, Table } from "antd";
import dayjs from "dayjs";
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function Reportes() {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
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
      const datosRes = await fetch(`/api/reports/datos?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const datos = await datosRes.json();
      setVentas(datos.ventas || []);
      setCompras(datos.compras || []);
    } catch {
      message.error("Error al obtener los datos");
    }
    setLoadingDatos(false);
  };

  const descargarPDF = (tipo) => {
    if (!dates || dates.length < 2) {
      message.warning("Selecciona un rango de fechas");
      return;
    }
    const from = dates[0].format("YYYY-MM-DD");
    const to = dates[1].format("YYYY-MM-DD");
    fetch(`/api/reports/${tipo}?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo descargar el PDF');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${tipo}_${from}_a_${to}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => message.error("Error al descargar el PDF"));
  };

  // Calcular totales
  const totalVentas = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalCompras = compras.reduce((sum, c) => sum + (c.total || 0), 0);

  return (
    <Card>
      <Button type="default" onClick={() => navigate('/home')} style={{ marginBottom: 16 }}>
        Ir al inicio
      </Button>
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
        <Button onClick={() => descargarPDF("ventas")} type="dashed">
          Descargar PDF Ventas
        </Button>
        <Button onClick={() => descargarPDF("compras")} type="dashed">
          Descargar PDF Compras
        </Button>
      </Space>
      <Card title="Ventas" style={{ marginTop: 24 }}>
        <Table dataSource={ventas} columns={columnsVentas} rowKey="id" pagination={false} />
      </Card>
      <Card title="Compras" style={{ marginTop: 24 }}>
        <Table dataSource={compras} columns={columnsCompras} rowKey="id" pagination={false} />
      </Card>
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>
          Total Ventas: <span style={{ color: "#389e0d" }}>${totalVentas.toFixed(2)}</span>
          <br />
          Total Compras: <span style={{ color: "#cf1322" }}>${totalCompras.toFixed(2)}</span>
          <br />
          Diferencia: <span style={{ color: totalVentas - totalCompras >= 0 ? "green" : "red" }}>
            ${(totalVentas - totalCompras).toFixed(2)}
          </span>
        </Title>
      </Card>
    </Card>
  );
}