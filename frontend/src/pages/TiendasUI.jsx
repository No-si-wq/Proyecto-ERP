import React, { useState, useEffect } from "react";
import { Layout, Tabs, Typography } from "antd";
import { ShopOutlined, AppstoreOutlined, DatabaseOutlined, PercentageOutlined } from "@ant-design/icons";
import { useTiendas } from "../hooks/useTiendas";
import { fetchInventarioByStore, createStore } from "../api/storesAPI";
import SidebarMenu from "../components/SidebarMenu";
import InventarioView from "../components/InventarioView";

const { Sider, Content } = Layout;
const { Title } = Typography;

// Función para obtener el componente de icono según el nombre
const getIcon = (iconName) => {
  switch (iconName) {
    case "shop":
      return <ShopOutlined />;
    case "appstore":
      return <AppstoreOutlined />;
    case "database":
      return <DatabaseOutlined />;
    case "percentage":
      return <PercentageOutlined />;
    default:
      return null;
  }
};

const TiendasUI = () => {
  const { treeData, setTreeData } = useTiendas();
  const [selectedKey, setSelectedKey] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar inventario cuando cambie la tienda seleccionada (solo módulo inventarios)
  useEffect(() => {
    if (!selectedKey?.includes("-Inventarios")) return;

    const tiendaClave = selectedKey.split("-")[0];
    fetchInventarioByStore(tiendaClave)
      .then(setInventario)
      .catch(() => setInventario([]));
  }, [selectedKey]);

  // Crear nueva tienda y actualizar árbol
  const handleCreate = async () => {
    const nombre = prompt("Nombre:");
    const clave = prompt("Clave:");
    const direccion = prompt("Dirección:");
    const telefono = prompt("Teléfono:");

    if (!nombre || !clave || !direccion || !telefono) {
      alert("Todos los campos son requeridos.");
      return;
    }

    try {
      const nueva = await createStore({ nombre, clave, direccion, telefono });

      const nuevaTiendaNode = {
        title: nueva.nombre,
        key: nueva.clave,
        icon: "shop",  // Solo el nombre del icono
        children: [
          { title: "Cajas", key: `${nueva.clave}-Cajas`, icon: "appstore" },
          { title: "Inventarios", key: `${nueva.clave}-Inventarios`, icon: "database" },
          { title: "Políticas", key: `${nueva.clave}-Políticas`, icon: "percentage" },
        ],
      };

      setTreeData((prev) => [...prev, nuevaTiendaNode]);
    } catch (error) {
      alert("Error al crear tienda", error);
    }
  };

  // Renderiza contenido basado en la tienda seleccionada
  const renderContent = () => {
    if (!selectedKey) return <Title level={4}>Seleccione una tienda o módulo</Title>;

    const [clave, modulo] = selectedKey.split("-");
    switch (modulo) {
      case "Inventarios":
        return <InventarioView inventario={inventario} searchTerm={searchTerm} onSearch={setSearchTerm} />;
      case "Cajas":
        return <p>Cajas aquí</p>;
      case "Políticas":
        return <p>Políticas de oferta aquí</p>;
      default:
        return <p>Resumen de tienda</p>;
    }
  };

  // Renderizar los iconos en el Sidebar
  const renderTreeWithIcons = (data) => {
    return data.map((node) => ({
      ...node,
      icon: getIcon(node.icon),  // Convertimos el nombre del icono en el componente JSX
      children: node.children ? renderTreeWithIcons(node.children) : [],
    }));
  };

  const renderedTreeData = renderTreeWithIcons(treeData);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={300} theme="light" style={{ padding: "16px 0" }}>
        <SidebarMenu
          treeData={renderedTreeData}
          selectedKey={selectedKey}
          onSelect={(keys, info) => setSelectedKey(info.node.key)}
          onCreate={handleCreate}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: 24 }}>
          <Tabs
            defaultActiveKey="1"
            type="card"
            items={[
              {
                key: "1",
                label: "Gestión",
                children: renderContent(),
              },
              {
                key: "2",
                label: "Configuración",
                children: <p>Configuración</p>,
              },
            ]}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TiendasUI;