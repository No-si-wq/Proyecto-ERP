import React, { useState, useEffect } from "react";
import { Layout, Tree, Card, Typography, Tabs, Button, Input } from "antd";
import {
  ShopOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  PercentageOutlined,
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const TiendasUI = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Simulados
  const cajasData = [
    { id: 1, tienda: "Tienda 1", nombre: "Caja 01", estado: "Abierta" },
    { id: 2, tienda: "Tienda 1", nombre: "Caja 02", estado: "Cerrada" },
    { id: 3, tienda: "Tienda 2", nombre: "Caja 01", estado: "Abierta" },
  ];

  const inventariosData = [
    { id: 1, tienda: "Tienda 1", producto: "Producto A", cantidad: 10 },
    { id: 2, tienda: "Tienda 1", producto: "Producto B", cantidad: 5 },
    { id: 3, tienda: "Tienda 2", producto: "Producto C", cantidad: 8 },
  ];

  useEffect(() => {
    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        const tiendas = data.map((tienda) => ({
          title: tienda.nombre,
          key: tienda.nombre,
          icon: <ShopOutlined />,
          children: [
            {
              title: "Cajas",
              key: `${tienda.nombre}-Cajas`,
              icon: <AppstoreOutlined />,
            },
            {
              title: "Inventarios",
              key: `${tienda.nombre}-Inventarios`,
              icon: <DatabaseOutlined />,
            },
            {
              title: "Políticas de oferta",
              key: `${tienda.nombre}-Políticas`,
              icon: <PercentageOutlined />,
            },
          ],
        }));
        setTreeData(tiendas);
      })
      .catch((err) => console.error("Error al cargar tiendas:", err));
  }, []);

  const handleSelect = (keys, info) => {
    setSelectedKey(info.node.key);
    setSearchTerm("");
  };

  const renderContent = () => {
    if (!selectedKey) return <Title level={4}>Seleccione una tienda o módulo</Title>;

    const [tienda, modulo] = selectedKey.split("-");

    if (!modulo) {
      return <Card title={`Información de ${tienda}`}>Resumen general de la tienda</Card>;
    }

    switch (modulo) {
      case "Cajas": {
        const cajasFiltradas = cajasData.filter(
          (caja) =>
            caja.tienda === tienda &&
            caja.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <Card title={`Cajas de ${tienda}`}>
            <Input.Search
              placeholder="Buscar caja"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            {cajasFiltradas.length === 0 ? (
              <p>No hay cajas para esta tienda.</p>
            ) : (
              <ul>
                {cajasFiltradas.map((caja) => (
                  <li key={caja.id}>
                    {caja.nombre} - Estado: {caja.estado}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      }

      case "Inventarios": {
        const inventarioFiltrado = inventariosData
          .filter((item) => item.tienda === tienda)
          .filter((item) =>
            item.producto.toLowerCase().includes(searchTerm.toLowerCase())
          );

        return (
          <Card title={`Inventario de ${tienda}`}>
            <Input.Search
              placeholder="Buscar producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            {inventarioFiltrado.length === 0 ? (
              <p>No hay productos en el inventario para esta tienda.</p>
            ) : (
              <ul>
                {inventarioFiltrado.map((item) => (
                  <li key={item.id}>
                    {item.producto} - Cantidad: {item.cantidad}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      }

      case "Políticas":
        return <Card title={`Políticas de oferta - ${tienda}`}>Promociones, descuentos, etc.</Card>;

      default:
        return <Card>Tienda</Card>;
    }
  };

  const handleCreateStore = async () => {
    const nombre = prompt("Ingrese el nombre de la nueva tienda:");
    const clave = prompt("Ingrese la clave de la tienda:");
    const direccion = prompt("Ingrese la dirección:");
    const telefono = prompt("Ingrese el teléfono:");

    if (!nombre || !clave || !direccion || !telefono) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, clave, direccion, telefono }),
      });

      if (!response.ok) throw new Error("Error al crear tienda");

      const nueva = await response.json();

      const nuevaTiendaNode = {
        title: nueva.nombre,
        key: nueva.nombre,
        icon: <ShopOutlined />,
        children: [
          {
            title: "Cajas",
            key: `${nueva.nombre}-Cajas`,
            icon: <AppstoreOutlined />,
          },
          {
            title: "Inventarios",
            key: `${nueva.nombre}-Inventarios`,
            icon: <DatabaseOutlined />,
          },
          {
            title: "Políticas de oferta",
            key: `${nueva.nombre}-Políticas`,
            icon: <PercentageOutlined />,
          },
        ],
      };

      setTreeData((prev) => [...prev, nuevaTiendaNode]);
    } catch (err) {
      console.error("Error al crear tienda:", err);
      alert("No se pudo crear la tienda");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} theme="light" style={{ padding: "16px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Button icon={<HomeOutlined />} onClick={() => navigate("/home")} size="small">
            Inicio
          </Button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Button icon={<PlusOutlined />} type="primary" size="small" onClick={handleCreateStore} />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              if (!selectedKey || selectedKey.includes("-")) {
                alert("Seleccione una tienda para editar.");
                return;
              }
              alert(`Editar ${selectedKey}`);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => {
              if (!selectedKey || selectedKey.includes("-")) {
                alert("Seleccione una tienda para eliminar.");
                return;
              }
              alert(`Eliminar ${selectedKey}`);
            }}
          />
        </div>

        <Title level={4}>Tiendas</Title>
        <Tree
          showIcon
          defaultExpandAll
          onSelect={handleSelect}
          treeData={treeData}
          style={{ padding: "0 16px" }}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: 24 }}>
          <Tabs defaultActiveKey="1" type="card">
            <TabPane tab="Gestión" key="1">
              {renderContent()}
            </TabPane>
            <TabPane tab="Configuración" key="2">
              <Card>Opciones de configuración de tiendas</Card>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TiendasUI;
