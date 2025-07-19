import React, { useEffect, useState } from "react";
import {
  Layout, Menu, Button, Table, InputNumber, Select, message, Typography, Space, Modal, Card
} from "antd";
import {
  PlusOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined, UserAddOutlined, ShoppingCartOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ProveedorForm from "../components/ProveedorForm"; 

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Compras = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [modalProveedor, setModalProveedor] = useState(false);
  const [proveedorLoading, setProveedorLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar proveedores y productos
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await fetch("/api/proveedores");
        setProveedores(await res.json());
      } catch {
        message.error("No se pudieron cargar los proveedores");
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
    fetchProveedores();
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

  // Limpiar todo para una nueva compra
  const handleNuevaCompra = () => {
    setCarrito([]);
    setProveedorSeleccionado(null);
  };

  // Calcular total
  const totalCompra = carrito.reduce((acc, item) => acc + item.total, 0);

  // Cálculo fiscal: precios incluyen impuesto
  const tasaImpuesto = 0.15;
  const impuestos = +(totalCompra - totalCompra / (1 + tasaImpuesto)).toFixed(2);
  const subtotal = +(totalCompra - impuestos).toFixed(2);

  // Registrar compra
  const registrarCompra = async () => {
    if (!proveedorSeleccionado) {
      message.warning("Selecciona un proveedor");
      return;
    }
    if (carrito.length === 0) {
      message.warning("Agrega productos al carrito");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: proveedorSeleccionado,
          productos: carrito.map(({ id, cantidad, price }) => ({ productoId: id, cantidad, price })),
        }),
      });
      message.success("Compra registrada");
      setCarrito([]);
      setProveedorSeleccionado(null);
      setModalPanelConfirmar(false);
    } catch {
      message.error("No se pudo registrar la compra");
    }
    setLoading(false);
  };

  // Handler para crear el proveedor desde ProveedorForm
  const handleCreateProveedor = async (values) => {
    setProveedorLoading(true);
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const nuevoProveedor = await res.json();
      setProveedores(prev => [...prev, nuevoProveedor]);
      setProveedorSeleccionado(nuevoProveedor.id);
      setModalProveedor(false);
      message.success("Proveedor agregado");
    } catch {
      message.error("No se pudo agregar el proveedor");
    }
    setProveedorLoading(false);
  };

  // Tabla del carrito de compras
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
      <Menu.Item key="nueva" icon={<PlusOutlined />} onClick={handleNuevaCompra}>
        Nueva compra
      </Menu.Item>
      <Menu.Item key="guardar" icon={<SaveOutlined />} onClick={() => setModalPanelConfirmar(true)} disabled={carrito.length === 0 || loading}>
        Registrar compra
      </Menu.Item>
      <Menu.Item key="recargar" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
        Recargar
      </Menu.Item>
      <Menu.Item key="proveedores" icon={<UserAddOutlined />} onClick={() => setModalProveedor(true)}>
        Nuevo proveedor
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

  // Selector de proveedor y botón para abrir el formulario
  const selectorProveedor = (
    <Space>
      <Select
        showSearch
        value={proveedorSeleccionado}
        placeholder="Selecciona proveedor"
        style={{ width: 250 }}
        options={proveedores.map(c => ({
          label: c.name,
          value: c.id,
        }))}
        onChange={setProveedorSeleccionado}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
      <Button icon={<UserAddOutlined />} onClick={() => setModalProveedor(true)} />
    </Space>
  );

  // Panel derecho para el modal de confirmación de compra
  const [modalPanelConfirmar, setModalPanelConfirmar] = useState(false);

  const panelConfirmar = (
    <div style={{ minWidth: 340, maxWidth: 350 }}>
      <Card
        type="inner"
        title="Resumen de Compra"
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Descto</span>
          <span>$0.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Impuestos</span>
          <span>${impuestos.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: 8 }}>
          <span>Total</span>
          <span>${totalCompra.toFixed(2)}</span>
        </div>
      </Card>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
        <Button onClick={() => setModalPanelConfirmar(false)}>Cancelar</Button>
        <Button
          type="primary"
          disabled={carrito.length === 0 || loading}
          onClick={registrarCompra}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#f4f6fa", padding: "0 16px", boxShadow: "0 1px 4px #eee" }}>
        {ribbon}
      </Header>
      <Content style={{ padding: 16, background: "#eaf0fb" }}>
        <div style={{
          maxWidth: 1200,
          margin: "auto",
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          boxShadow: "0 2px 8px #d5deef"
        }}>
          <Title level={4} style={{ marginBottom: 16 }}>Registro de Compras</Title>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <span>Proveedor:</span>
                {selectorProveedor}
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
                    <Table.Summary.Cell index={1}><b>${totalCompra.toFixed(2)}</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                )}
              />
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                block
                style={{ fontSize: 24, height: 60, marginTop: 8 }}
                onClick={() => setModalPanelConfirmar(true)}
                disabled={carrito.length === 0 || loading}
              >
                REGISTRAR COMPRA
              </Button>
            </div>
            {/* Panel lateral vacío: podrías poner historial de compras, pero para simplicidad lo dejamos vacío */}
          </div>
        </div>
      </Content>
      <ProveedorForm
        visible={modalProveedor}
        onCreate={handleCreateProveedor}
        onCancel={() => setModalProveedor(false)}
        confirmLoading={proveedorLoading}
      />
      <Modal
        open={modalPanelConfirmar}
        onCancel={() => setModalPanelConfirmar(false)}
        footer={null}
        width={400}
        centered
        destroyOnClose
      >
        {panelConfirmar}
      </Modal>
    </Layout>
  );
};

export default Compras;