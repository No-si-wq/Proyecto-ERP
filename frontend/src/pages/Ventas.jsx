import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Table, InputNumber, Select, message, Typography, Space } from "antd";
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined, DollarOutlined, SaveOutlined, ReloadOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ConfirmarVentaCard from "../components/ConfirmarVentaCard";
import RecibidoEfectivoCard from "../components/RecibidoEfectivoCard";

import { Modal } from "antd";
import ClienteForm from "../components/ClienteForm";

const { Header, Content } = Layout;
const { Title } = Typography;

const Ventas = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  

  // Cargar clientes y productos
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch("/api/clientes");
        setClientes(await res.json());
      } catch {
        message.error("No se pudieron cargar los clientes");
      }
    };
    const fetchProductos = async () => {
      try {
        const res = await fetch("/api/inventario");
        setProductos(await res.json());
      } catch {
        message.error("No se pudieron cargar los productos");
      }
    };
    fetchClientes();
    fetchProductos();
  }, []);

  // Agregar producto al carrito
  const agregarProducto = (id) => {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    const existe = carrito.find(item => item.id === id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: item.cantidad + 1, total: (item.cantidad + 1) * item.price } : item));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1, total: prod.price }]);
    }
  };

  // Cambiar cantidad de un producto en el carrito
  const cambiarCantidad = (id, cantidad) => {
    setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad, total: cantidad * item.price } : item));
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Calcular total
  const totalVenta = carrito.reduce((acc, item) => acc + item.total, 0);

  // Registrar venta
  const registrarVenta = async () => {
    if (!clienteSeleccionado) {
      message.warning("Selecciona un cliente");
      return;
    }
    if (carrito.length === 0) {
      message.warning("Agrega productos al carrito");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: clienteSeleccionado,
          productos: carrito.map(({ id, cantidad }) => ({ productoId: id, cantidad })),
        }),
      });
      message.success("Venta registrada");
      setCarrito([]);
    } catch {
      message.error("No se pudo registrar la venta");
    }
    setLoading(false);
  };

  // Handler para crear el cliente desde el ClienteForm reutilizable
  const handleCreateCliente = async (values) => {
    setClienteLoading(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const nuevoCliente = await res.json();
      setClientes(prev => [...prev, nuevoCliente]);
      setClienteSeleccionado(nuevoCliente.id); // selecciona el nuevo cliente
      setModalCliente(false);
      message.success("Cliente agregado");
    } catch {
      message.error("No se pudo agregar el cliente");
    }
    setClienteLoading(false);
  };

  // Columnas para la tabla del carrito
  const columns = [
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad", width: 100,
      render: (text, record) => (
        <InputNumber min={1} value={record.cantidad}
          onChange={value => cambiarCantidad(record.id, value)} />
      )
    },
    { title: "Artículo", dataIndex: "name", key: "name", width: 150 },
    { title: "Descripción", dataIndex: "description", key: "description", width: 200 },
    { title: "Precio", dataIndex: "price", key: "price", width: 100 },
    { title: "Total", dataIndex: "total", key: "total", width: 100 },
    {
      title: "",
      dataIndex: "id",
      width: 50,
      render: (id) => (
        <Button icon={<DeleteOutlined />} danger size="small" onClick={() => eliminarDelCarrito(id)} />
      )
    },
  ];

  // Ribbon de acciones arriba
  const ribbon = (
    <Menu mode="horizontal" style={{ marginBottom: 8 }}>
      <Menu.Item key="nueva" icon={<PlusOutlined />} onClick={() => setCarrito([])}>
        Nueva venta
      </Menu.Item>
      <Menu.Item key="guardar" icon={<SaveOutlined />} onClick={registrarVenta} disabled={carrito.length === 0 || loading}>
        Pagar
      </Menu.Item>
      <Menu.Item key="recargar" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
        Recargar
      </Menu.Item>
      <Menu.Item key="clientes" icon={<UserAddOutlined />} onClick={() => setModalCliente(true)}>
        Nuevo cliente
      </Menu.Item>
      <Menu.Item key="inicio" icon={<ShoppingCartOutlined />} onClick={() => navigate("/home")} style={{ float: "right" }}>
        Ir al inicio
      </Menu.Item>
    </Menu>
  );

  // Selector de productos
  const selectorProductos = (
    <Select
      showSearch
      placeholder="Buscar o seleccionar producto"
      style={{ width: 300 }}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={productos.map(p => ({
        label: p.name,
        value: p.id,
      }))}
      onSelect={agregarProducto}
    />
  );

  // Selector de cliente y botón para abrir el formulario
  const selectorCliente = (
    <Space>
      <Select
        showSearch
        value={clienteSeleccionado}
        placeholder="Selecciona cliente"
        style={{ width: 250 }}
        options={clientes.map(c => ({
          label: c.name,
          value: c.id,
        }))}
        onChange={setClienteSeleccionado}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
      <Button icon={<UserAddOutlined />} onClick={() => setModalCliente(true)} />
    </Space>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#f4f6fa", padding: "0 16px", boxShadow: "0 1px 4px #eee" }}>
        {ribbon}
      </Header>
      <Content style={{ padding: 16, background: "#eaf0fb" }}>
        <div style={{ maxWidth: 1200, margin: "auto", background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px #d5deef" }}>
          <Title level={4} style={{ marginBottom: 16 }}>Punto de Venta</Title>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <span>Cliente:</span>
            {selectorCliente}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <span>Agregar producto:</span>
            {selectorProductos}
          </div>
          <Table
            columns={columns}
            dataSource={carrito}
            rowKey="id"
            pagination={false}
            style={{ marginBottom: 16 }}
            size="small"
            scroll={{ x: true }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}><b>Total:</b></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><b>${totalVenta.toFixed(2)}</b></Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )}
          />
          <Button
            type="primary"
            size="large"
            icon={<DollarOutlined />}
            block
            style={{ fontSize: 24, height: 60, marginTop: 8 }}
            onClick={registrarVenta}
            disabled={carrito.length === 0 || loading}
          >
            PAGAR
          </Button>
        </div>
      </Content>
      <ClienteForm
        visible={modalCliente}
        onCreate={handleCreateCliente}
        onCancel={() => setModalCliente(false)}
        confirmLoading={clienteLoading}
      />
    </Layout>
  );
};

export default Ventas;