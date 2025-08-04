import React, { useEffect, useState } from "react";
import {
  Layout, Menu, Button, Table, InputNumber, Select, message, Typography, Space, Modal, Card
} from "antd";
import {
  PlusOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined, UserAddOutlined, ShoppingCartOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ProveedorForm from "../components/ProveedorForm";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Compras = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchParams] = useSearchParams();
  const idCompra = searchParams.get("id");
  const [carrito, setCarrito] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [modalProveedor, setModalProveedor] = useState(false);
  const [proveedorLoading, setProveedorLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folio, setFolio] = useState("");
  const [metodosPago, setMetodosPago] = useState([]);
  const [modalSeleccionTienda, setModalSeleccionTienda] = useState(false);
  const [tiendasDisponibles, setTiendasDisponibles] = useState([]);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState(null);
  const [mostradorSeleccionado, setMostradorSeleccionado] = useState(null);
  const ventaHabilitada = Boolean(tiendaSeleccionada && mostradorSeleccionado);
  const [compraCargadaDesdeId, setCompraCargadaDesdeId] = useState(false);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [valorIngreso, setValorIngreso] = useState(0);
  const esEdicion = Boolean(idCompra);

  // Nuevos estados para el flujo de pago
  const [modalPanelConfirmar, setModalPanelConfirmar] = useState(false);
  const [modalRecibido, setModalRecibido] = useState(false);
  const [pagosRecibidos, setPagosRecibidos] = useState([]);

   const fetchCompra = async (id) => {
      try {
        const res = await fetch("/api/compras");
        const data = await res.json();
        const compra = data.find(v => v.id.toString() === id.toString());
  
        if (!compra) {
          message.error("compra no encontrada");
          navigate("/compras/facturas");
          return;
        }
  
        setProveedorSeleccionado(compra.supplierId);
        setTiendaSeleccionada(compra.storeId);
        setMostradorSeleccionado(compra.cajaId);
  
        const productosCompra = compra.productos.map(p => ({
          id: p.productoId,
          name: p.producto,
          description: "", 
          price: p.price,
          cantidad: p.cantidad,
          total: p.price * p.cantidad,
          tax: { percent: 0 },
        }));
  
        setCarrito(productosCompra);
        setCompraCargadaDesdeId(true);
        setFolio(compra.folio); 
  
        message.success("Compra cargada para edición");
      } catch (error) {
        message.error("Error cargando la compra para edición");
        console.error(error);
      }
    };

    useEffect(() => {
      if (idCompra) {
        fetchCompra(idCompra);
      }
    }, [idCompra]);

  // Función para obtener el próximo folio desde backend
  const fetchFolio = async () => {
    try {
      const res = await fetch("/api/compras/next-folio");
      const data = await res.json();
      setFolio(data.folio);
    } catch {
      setFolio("ERROR");
    }
  };

  useEffect(() => {
    if (!esEdicion) {
      fetchFolio();
    }
  }, []);

    useEffect(() => {
    if (esEdicion) {
      axios.get(`/api/compras/${idCompra}`).then(({ data }) => {
        setFolio(data.folio);
        setProveedores(data.proveedor);
        setProductos(data.detalles);
        setPagosRecibidos(data.pagos);
      });
    }
  }, []);

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
    const fetchMetodosPago = async () => {
      try {
        const res = await fetch("/api/payment-methods");
        const { data } = await res.json();
        setMetodosPago(data);
      } catch {
        message.error("No se pudieron cargar los métodos de pago");
      }
    };
    fetchMetodosPago();
    fetchProveedores();
  }, []);

  useEffect(() => {
    const mostrarModalSeleccion = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setTiendasDisponibles(data);
          if (!idCompra) {
            setModalSeleccionTienda(true);
          }
      } catch {
        message.error("No se pudieron cargar las tiendas");
      }
    };

    mostrarModalSeleccion();
  }, [idCompra]);

    const fetchProductos = async () => {
    if (!tiendaSeleccionada) {
      message.warning("Selecciona una tienda primero.");
      return;
    }

    try {
      const res = await fetch(`/api/inventario/by-store/${tiendaSeleccionada}`);
      const data = await res.json();
      console.log("Productos cargados para tienda:", tiendaSeleccionada, data);
      setProductos(data);
    } catch {
      message.error("No se pudieron cargar los productos");
    }
  };

  useEffect(() => {
    if (tiendaSeleccionada) {
      fetchProductos();
    }
  }, [tiendaSeleccionada]);

    const handleConfirmarPago = async () => {
      // Sumar todos los importes recibidos
      const totalRecibido = pagosRecibidos.reduce((acc, pago) => acc + pago.importe, 0);
      const cambioCalculado = +(totalRecibido - totalCompra).toFixed(2);
      setModalPanelConfirmar(false);
      await registrarCompra({ importeRecibido: totalRecibido, cambio: cambioCalculado });
    };

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
    setModalSeleccionTienda(true);
    setPagosRecibidos([]);
    fetchFolio();
  };

  // Calcular total
  const totalCompra = carrito.reduce((acc, item) => acc + item.total, 0);

  // Cálculo más preciso considerando el impuesto por producto
  const impuestos = carrito.reduce((acc, item) => {
    const taxRate = item.tax?.percent ?? 0; // Si no tiene impuesto, se asume 0%
    const priceSinImpuesto = item.price / (1 + taxRate);
    const impuestoItem = (item.price - priceSinImpuesto) * item.cantidad;
    return acc + impuestoItem;
  }, 0);

  const subtotal = carrito.reduce((acc, item) => {
    const taxRate = item.tax?.percent ?? 0;
    const priceSinImpuesto = item.price / (1 + taxRate);
    return acc + priceSinImpuesto * item.cantidad;
  }, 0);

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
          storeId: tiendaSeleccionada,
          cajaId: mostradorSeleccionado, 
          productos: carrito.map(({ id, cantidad, price }) => ({ productoId: id, cantidad, price })),
          pagos: pagosRecibidos,
        }),
      });
      message.success("Compra registrada");
      setCarrito([]);
      setProveedorSeleccionado(null);
      setPagosRecibidos([]);
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
      <Menu.Item
        key="guardar"
        icon={<SaveOutlined />}
        onClick={() => setModalPanelConfirmar(true)}
        disabled={carrito.length === 0 || loading}
      >
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
      disabled={!ventaHabilitada}
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


  // Columnas para la tabla de formas de pago (demo)
  const formasPago = metodosPago.map(mp => ({
    key: mp.id,
    descripcion: `${mp.clave} - ${mp.descripcion}`,
  }));

  const columnsFormasPago = [
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
  ];

  // Panel derecho para el modal de confirmación de compra
  const panelConfirmar = (
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
            const totalRecibido = pagosRecibidos.reduce((acc, p) => acc + p.importe, 0);
            if (totalRecibido >= totalCompra) {
              message.warning("Ya se ha recibido el monto total de la venta");
              return;
            }
            setMetodoSeleccionado([{ metodo: record.descripcion, importe: totalCompra }]); // o mostrar modal para capturar importe
            setModalPanelConfirmar(false);
            setTimeout(() => setModalRecibido(true), 250);
          }
        })}
      />
      <Card
        type="inner"
        title="Resumen de Compra"
        style={{ marginBottom: 8 }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>L. {subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Descto</span>
          <span>L. 0.00</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Impuestos</span>
          <span>L. {impuestos.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: 8 }}>
          <span>Total</span>
          <span>L. {totalCompra.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Recibido</span>
          <span>L. {pagosRecibidos.reduce((acc, p) => acc + p.importe, 0).toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Cambio</span>
          <span>L. {(pagosRecibidos.reduce((acc, p) => acc + p.importe, 0) - totalCompra).toFixed(2)}</span>
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
              <span>L. {p.importe.toFixed(2)}</span>
            </div>
          )
        }
      </Card>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
        <Button onClick={() => { setPagosRecibidos([]); setModalPanelConfirmar(false); }}>Cancelar</Button>
        <Button
          type="primary"
          disabled={pagosRecibidos.reduce((acc, p) => acc + p.importe, 0) < totalCompra}
          onClick={handleConfirmarPago}
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
          <Text type="secondary" style={{ fontSize: 18, fontWeight: "bold" }}>FOLIO: {folio}</Text>
            {(!ventaHabilitada ) && (
              <div style={{ background: "#fff3cd", padding: 16, margin: "16px 0", border: "1px solid #ffeeba", borderRadius: 6 }}>
                <Text strong>Debes seleccionar una tienda y un mostrador para comenzar a registrar una venta.</Text>
              </div>
            )}
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
                summary={() => 
                  ventaHabilitada ?  (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}><b>Total:</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><b>L. {totalCompra.toFixed(2)}</b></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                ) : null
              }
              />
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                block
                style={{ fontSize: 24, height: 60, marginTop: 8 }}
                onClick={() => setModalPanelConfirmar(true)}
                disabled={!ventaHabilitada || carrito.length === 0 || loading}
              >
                REGISTRAR COMPRA
              </Button>
            </div>
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
        open={modalSeleccionTienda}
        title="Selecciona la Tienda y Mostrador"
        onCancel={() => setModalSeleccionTienda(false)}
        onOk={() => {
          if (!tiendaSeleccionada || !mostradorSeleccionado) {
            message.warning("Selecciona tienda y mostrador");
            return;
          }

          fetchFolio(); // Obtener folio para la venta
          fetchProductos(tiendaSeleccionada);

          if(!compraCargadaDesdeId){
            setCarrito([]);
            setPagosRecibidos([]);
          }

          setModalSeleccionTienda(false);
          message.success(`Tienda ${tiendaSeleccionada} / Mostrador ${mostradorSeleccionado} seleccionado`);
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <label>Tienda:</label>
          <Select
            style={{ width: "100%" }}
            placeholder="Selecciona una tienda"
            value={tiendaSeleccionada}
            onChange={(value) => {
              setTiendaSeleccionada(value);
              setMostradorSeleccionado(null); // Reinicia mostrador al cambiar tienda
            }}
          >
            {tiendasDisponibles.map((tienda) => (
              <Select.Option key={tienda.id} value={tienda.id}>
                {tienda.nombre}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div>
          <label>Mostrador:</label>
          <Select
            style={{ width: "100%" }}
            placeholder="Selecciona un mostrador"
            value={mostradorSeleccionado}
            onChange={setMostradorSeleccionado}
            disabled={!tiendaSeleccionada}
          >
            {tiendaSeleccionada &&
              tiendasDisponibles
                .find(t => t.id === tiendaSeleccionada)
                ?.cajas?.map((mostrador) => (
                  <Select.Option key={mostrador.id} value={mostrador.id}>
                    {mostrador.descripcion || mostrador.numeroDeCaja}
                  </Select.Option>
                ))}
          </Select>
        </div>
      </Modal>
      {/* MODAL PARA CONFIRMAR COMPRA Y FORMAS DE PAGO */}
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
      {/* MODAL PARA INGRESAR IMPORTE */}
      <Modal
        open={modalRecibido}
        footer={null}
        onCancel={() => {
          setModalRecibido(false);
          setValorIngreso(0);
          setMetodoSeleccionado(null);
        }}
        centered
        destroyOnClose
      >
        <div style={{ padding: 16 }}>
          <Title level={5}>Monto recibido</Title>
          <InputNumber
            style={{ width: "100%", marginBottom: 16 }}
            min={1}
            step={1}
            addonBefore="L."
            placeholder="Ingresa el monto"
            onChange={(value) => {
              if (isNaN(value)) return;
              setValorIngreso(Number(value));
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setModalRecibido(false)}>Cancelar</Button>
            <Button
              type="primary"
              disabled={valorIngreso <= 0 || !metodoSeleccionado}
              onClick={() => {
                setPagosRecibidos(prev => [...prev, { metodo: metodoSeleccionado, importe: valorIngreso }]);
                setModalRecibido(false);
                setTimeout(() => setModalPanelConfirmar(true), 250);
              }}
            >
              Aceptar
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Compras;
