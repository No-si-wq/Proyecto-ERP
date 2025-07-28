import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Button,
  message,
  Tooltip,
  Space,
  Tabs,
} from "antd";
import {
  ReloadOutlined,
  FilePdfOutlined,
  AppstoreOutlined,
  HomeOutlined,
  TeamOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const InventarioConsulta = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener tiendas al iniciar
  useEffect(() => {
    fetchTiendas();
  }, []);

  // Cargar inventario cuando cambia la tienda seleccionada
  useEffect(() => {
    if (storeId !== null) {
      console.log("Consultando productos para tienda:", storeId);
      fetchProductos(storeId);
    }
  }, [storeId]);

  const fetchTiendas = async () => {
    try {
      const res = await fetch("/api/stores");
      if (!res.ok) throw new Error("No se pudieron cargar las tiendas");
      const data = await res.json();
      console.log("Tiendas cargadas:", data);
      setTiendas(data);
      if (data.length > 0) setStoreId(data[0].id);
    } catch (error) {
      console.error("Error al cargar tiendas:", error);
      message.error("Error al cargar tiendas");
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventarios/tienda/${storeId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Formato inválido");
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      message.error("Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (value) =>
        `L. ${!isNaN(Number(value)) ? Number(value).toFixed(2) : "0.00"}`,
    },
    {
      title: "Impuesto",
      dataIndex: "tax",
      key: "tax",
      render: (tax) => {
        if (!tax || typeof tax.percent !== "number") return "Sin impuesto";
        const percent = Number(tax.percent);
        return isNaN(percent) ? "Sin impuesto" : `(${(percent * 100).toFixed(2)}%)`;
      },
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (cat) =>
        cat && typeof cat.name === "string" ? cat.name : "Sin categoría",
    },
    {
      title: "Tienda",
      dataIndex: "store",
      key: "store",
      render: (store) =>
        store && typeof store.name === "string" ? store.name : "Sin tienda",
    },
  ];

  const ribbonActions = (
    <Tabs
      defaultActiveKey="1"
      type="card"
      style={{ marginBottom: 16 }}
      tabBarStyle={{ marginBottom: 0 }}
    >
      <TabPane
        tab={
          <span>
            <AppstoreOutlined />
            Archivo
          </span>
        }
        key="1"
      >
        <br />
        <Space>
          <Tooltip title="Ir al inicio">
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate("/home")}
              style={{ background: "#f5f5f5" }}
            >
              Inicio
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar inventario">
            <Button icon={<ReloadOutlined />} onClick={() => fetchProductos(storeId)}>
              Actualizar
            </Button>
          </Tooltip>
          <Tooltip title="Exportar PDF">
            <Button icon={<FilePdfOutlined />}>PDF</Button>
          </Tooltip>
        </Space>
      </TabPane>
      <TabPane
        tab={
          <span>
            <TeamOutlined />
            Catálogos
          </span>
        }
        key="2"
      >
        <Space>
          <Button icon={<SearchOutlined />}>Buscar</Button>
        </Space>
      </TabPane>
      <TabPane
        tab={
          <span>
            <SettingOutlined />
            Configuración
          </span>
        }
        key="3"
      >
        <Space>
          <Button icon={<SettingOutlined />}>Opciones</Button>
        </Space>
      </TabPane>
    </Tabs>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          background: "#e7eaf6",
          borderRadius: 8,
          boxShadow: "0 2px 8px #dbeafe50",
          padding: 16,
        }}
      >
        {ribbonActions}

        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Seleccionar tienda:</span>
          <Select
            value={storeId}
            onChange={(value) => setStoreId(value)}
            style={{ width: 240 }}
          >
            {tiendas.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={productos}
          loading={loading}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 12 }}
          style={{ background: "white", borderRadius: 4 }}
        />
      </div>
    </div>
  );
};

export default InventarioConsulta;