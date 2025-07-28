import React, { useState } from "react";
import { Layout, Menu, Typography, Button } from "antd";
import {
  LogoutOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FileTextOutlined ,
  ShopOutlined,
  CreditCardOutlined,
  DesktopOutlined,
  ApartmentOutlined,
  TagsOutlined,
  GlobalOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const modules = [
  {
    key: "ventas",
    title: "Ventas",
    icon: <DollarOutlined />,
    submenu: [
      { key: "panel-ventas", title: "Panel de ventas", icon: <FileAddOutlined />, path: "/ventas/panel" },
      { key: "ventas", title: "Punto de venta", icon: <ShoppingCartOutlined />, path: "/ventas" },
      { key: "clientes", title: "Clientes", icon: <UserOutlined />, path: "/clientes" }
    ]
  },
  {
    key: "compras",
    title: "Compras",
    icon: <ShoppingCartOutlined />,
    submenu: [
      { key: "compras", title: "Registro de compras", icon: <ShoppingCartOutlined />, path: "/compras" },
      { key: "facturas-compras", title: "Panel de compras", icon: <FileAddOutlined />, path: "/compras/facturas" },
      { key: "proveedores", title: "Proveedores", icon: <TeamOutlined />, path: "/proveedores" }
    ]
  },
  // NUEVO MENÚ DE CATÁLOGOS
  {
    key: "catalogos",
    title: "Catálogos",
    icon: <FolderOpenOutlined />,
    submenu: [
      { key: "tiendas", title: "Tiendas", icon: <ShopOutlined />, path: "/tiendas" },
      { key: "usuarios", title: "Usuarios", icon: <UserOutlined />, path: "/usuarios" },
      { key: "formas-pago", title: "Formas de pago", icon: <CreditCardOutlined />, path: "/formas-pago" },
      { key: "dispositivos", title: "Dispositivos", icon: <DesktopOutlined />, path: "/dispositivos" },
      { key: "lineas", title: "Líneas", icon: <ApartmentOutlined />, path: "/lineas" },
      { key: "departamentos", title: "Departamentos", icon: <TagsOutlined />, path: "/departamentos" },
      { key: "categorias", title: "Categorías", icon: <FileOutlined />, path: "/categorias" },
      { key: "monedas", title: "Monedas", icon: <GlobalOutlined />, path: "/monedas" },
      { key: "impuestos", title: "Esquema de Impuestos", icon: <FileTextOutlined  />, path: "/impuestos" },
      { key: "cajas", title: "Cajas Registradoras", icon: <FontAwesomeIcon icon={faCashRegister} />, path: "/cajas" },
      // Puedes agregar más catálogos aquí
    ]
  },
  {
    key: "inventario",
    title: "Inventario",
    icon: <AppstoreOutlined />,
    submenu: [
      { key: "inventario", title: "Panel de inventario", icon: <FileSearchOutlined />, path: "/inventarioConsulta" }
    ]
  },
  {
    key: "reportes",
    title: "Reportes",
    icon: <BarChartOutlined />,
    submenu: [
      { key: "reportes", title: "Panel de reportes", icon: <BarChartOutlined />, path: "/reportes" }
    ]
  }
];

const Home = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(null);

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    for (const mod of modules) {
      if (mod.submenu) {
        const found = mod.submenu.find((sm) => sm.key === e.key);
        if (found && found.path) {
          navigate(found.path);
          return;
        }
      }
    }
  };

  const handleLogout = () => {
    setAuth(false);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isWelcome = location.pathname === "/home";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 8px #f0f1f2",
          zIndex: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <Menu
            mode="horizontal"
            selectedKeys={selectedKey ? [selectedKey] : []}
            onClick={handleMenuClick}
            style={{ borderBottom: "none" }}
          >
            {modules.map((mod) =>
              mod.submenu ? (
                <Menu.SubMenu
                  key={mod.key}
                  title={mod.title}
                  icon={mod.icon}
                  popupClassName="ribbon-submenu"
                >
                  {mod.submenu.map((sm) => (
                    <Menu.Item key={sm.key} icon={sm.icon}>
                      {sm.title}
                    </Menu.Item>
                  ))}
                </Menu.SubMenu>
              ) : (
                <Menu.Item key={mod.key} icon={mod.icon}>
                  {mod.title}
                </Menu.Item>
              )
            )}
          </Menu>
        </div>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ marginLeft: 16 }}
        >
          Cerrar sesión
        </Button>
      </Header>
      <Content
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
          background: "linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {isWelcome && (
          <div
            style={{
              background: "#fff",
              padding: 48,
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              textAlign: "center",
              maxWidth: 600,
              width: "100%",
            }}
          >
            <Title level={2}>¡Bienvenido al ERP!</Title>
            <Text type="secondary">
              Selecciona un módulo o una acción en el menú superior para comenzar a trabajar en tu sistema.
            </Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Home;