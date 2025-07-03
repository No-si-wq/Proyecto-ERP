import React, { useEffect, useState } from "react";
import {
  Layout, Menu, Button, Table, InputNumber, Select, message, Typography, Space, Modal, Card
} from "antd";
import {
  PlusOutlined, DeleteOutlined, ShoppingCartOutlined, DollarOutlined, SaveOutlined, ReloadOutlined, UserAddOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ConfirmarVentaCard from "../components/ConfirmarVentaCard";
import RecibidoEfectivoCard from "../components/RecibidoEfectivoCard";
import ClienteForm from "../components/ClienteForm";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Ventas = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para el flujo de confirmación y recibido
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalPanelPago, setModalPanelPago] = useState(false);
  const [modalRecibido, setModalRecibido] = useState(false);
  const [ventaEnProceso, setVentaEnProceso] = useState({ subtotal: 0, impuestos: 0, total: 0 });
  const [importeRecibido, setImporteRecibido] = useState(null);
  const [cambio, setCambio] = useState(null);

  // Formas de pago (solo efectivo y vales para demo)
  const formasPago = [
    { key: "efectivo", tecla: "Ctrl+E", descripcion: "Efectivo" },
    { key: "vales", tecla: "Ctrl+6", descripcion: "Vales despensa" },
  ];
  const columnsFormasPago = [
    { title: "Tecla", dataIndex: "tecla", key: "tecla", width: 80 },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
  ];
  const [pagosRecibidos, setPagosRecibidos] = useState([]);

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

  // Cálculo fiscal: precios ya incluyen impuesto
  const tasaImpuesto = 0.15;
  const impuestos = +(totalVenta - totalVenta / (1 + tasaImpuesto)).toFixed(2);
  const subtotal = +(totalVenta - impuestos).toFixed(2);

  // Registrar venta (adaptada para guardar importe recibido y cambio)
  const registrarVenta = async ({ importeRecibido, cambio }) => {
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
          importeRecibido,
          cambio,
          formasPago: pagosRecibidos,
        }),
      });
      message.success(`Venta registrada. Cambio: $${cambio}`);
      setCarrito([]);
      setImporteRecibido(null);
      setCambio(null);
      setPagosRecibidos([]);
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
      setClienteSeleccionado(nuevoCliente.id);
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
      <Menu.Item key="guardar" icon={<SaveOutlined />} onClick={() => {
        if (carrito.length === 0 || loading) return;
        setVentaEnProceso({ subtotal, impuestos, total: totalVenta });
        setModalConfirmar(true);
      }} disabled={carrito.length === 0 || loading}>
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

  // Al confirmar la venta, se abre el modal de panel de formas de pago
  const handleConfirmarVenta = () => {
    setModalConfirmar(false);
    setModalPanelPago(true);
  };

  // Al recibir el importe, calcula el cambio, registra la venta y muestra mensaje
  const handleAceptarImporte = async (importe) => {
    setImporteRecibido(importe);
    const cambioCalculado = +(importe - totalVenta).toFixed(2);
    setCambio(cambioCalculado);
    setPagosRecibidos([{ metodo: "Efectivo", importe }]);
    setModalRecibido(false);
    await registrarVenta({ importeRecibido: importe, cambio: cambioCalculado });
  };

  // Panel derecho para el modal de pago
  const panelPagoYDesglose = (
    <div style={{ minWidth: 340, maxWidth: 350 }}>
      <Table
        columns={columnsFormasPago}
        dataSource={formasPago}
        pagination={false}
        size="small"
        bordered
        style={{ marginBottom: 8 }}
        rowKey="key"
        onRow={record => ({
          onClick: () => {
            // Solo efectivo implementado por ahora
            if (record.key === "efectivo") {
              setModalPanelPago(false);
              setTimeout(() => setModalRecibido(true), 250);
            }
          }
        })}
      />
      <Card
        type="inner"
        title="Resumen de Venta"
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
          <span>${totalVenta.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Recibido</span>
          <span>${importeRecibido ? importeRecibido.toFixed(2) : "0.00"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Cambio</span>
          <span>${cambio ? cambio.toFixed(2) : "0.00"}</span>
        </div>
      </Card>
      <Card
        type="inner"
        title="Formas de Pago Recibidas"
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: 8 }}
      >
        {pagosRecibidos.length === 0
          ? <Text type="secondary">Sin pagos registrados</Text>
          : pagosRecibidos.map((p, idx) =>
            <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{p.metodo}</span>
              <span>${p.importe.toFixed(2)}</span>
            </div>
          )
        }
      </Card>
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
          <Title level={4} style={{ marginBottom: 16 }}>Punto de Venta</Title>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
            <div style={{ flex: 1 }}>
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
                onClick={() => {
                  setVentaEnProceso({ subtotal, impuestos, total: totalVenta });
                  setModalConfirmar(true);
                }}
                disabled={carrito.length === 0 || loading}
              >
                PAGAR
              </Button>
            </div>
            {/* YA NO SE MUESTRA EL PANEL DE PAGO AQUÍ, SOLO EN EL MODAL */}
          </div>
        </div>
      </Content>
      <ClienteForm
        visible={modalCliente}
        onCreate={handleCreateCliente}
        onCancel={() => setModalCliente(false)}
        confirmLoading={clienteLoading}
      />

      {/* MODAL CONFIRMAR VENTA */}
      <Modal
        open={modalConfirmar}
        footer={null}
        onCancel={() => setModalConfirmar(false)}
        centered
        destroyOnClose
      >
        <ConfirmarVentaCard
          totalConImpuesto={ventaEnProceso.total}
          tasaImpuesto={tasaImpuesto}
          onCancel={() => setModalConfirmar(false)}
          onConfirm={handleConfirmarVenta}
        />
      </Modal>

      {/* MODAL PANEL DE FORMAS DE PAGO Y DESGLOSE */}
      <Modal
        open={modalPanelPago}
        onCancel={() => setModalPanelPago(false)}
        footer={null}
        width={400}
        centered
        destroyOnClose
      >
        {panelPagoYDesglose}
      </Modal>

      {/* MODAL RECIBIDO EFECTIVO */}
      <Modal
        open={modalRecibido}
        footer={null}
        onCancel={() => setModalRecibido(false)}
        centered
        destroyOnClose
      >
        <RecibidoEfectivoCard
          total={totalVenta}
          onCancel={() => setModalRecibido(false)}
          onAceptar={handleAceptarImporte}
        />
      </Modal>
    </Layout>
  );
};

export default Ventas;