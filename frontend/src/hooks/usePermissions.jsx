import { useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { canAccess } from "../utils/permission";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister } from '@fortawesome/free-solid-svg-icons';

import {
  DollarOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  ShopOutlined,
  CreditCardOutlined,
  DesktopOutlined,
  ApartmentOutlined,
  TagsOutlined,
  GlobalOutlined,
  FileOutlined,
} from "@ant-design/icons";

// Módulos crudos del menú
const rawModules = [
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
      { key: "impuestos", title: "Esquema de Impuestos", icon: <FileTextOutlined />, path: "/impuestos" },
      { key: "cajas", title: "Cajas Registradoras", icon: <FontAwesomeIcon icon={faCashRegister} />, path: "/cajas" }
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

export const usePermissions = () => {
  const { auth } = useAuth();
  const role = auth?.role || "";

  const filteredModules = useMemo(() => {
    return rawModules
      .map((mod) => {
        const submenu = mod.submenu?.filter((item) => canAccess(role, item.path)) || [];
        return submenu.length > 0 ? { ...mod, submenu } : null;
      })
      .filter(Boolean);
  }, [role]);

  return { modules: filteredModules };
};