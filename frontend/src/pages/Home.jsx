import React from 'react';
import { Button, Typography, Card, Row, Col, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import {
  LogoutOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const modules = [
  {
    title: "Ventas",
    description: "Gestiona las ventas y los clientes.",
    icon: <DollarOutlined style={{ fontSize: 36, color: "#52c41a" }} />,
    path: "/ventas",
  },
  {
    title: "Compras",
    description: "Administra las compras y proveedores.",
    icon: <ShoppingCartOutlined style={{ fontSize: 36, color: "#1890ff" }} />,
    path: "/compras",
  },
  {
    title: "Inventario",
    description: "Consulta y controla el inventario.",
    icon: <AppstoreOutlined style={{ fontSize: 36, color: "#faad14" }} />,
    path: "/inventario",
  },
  {
    title: "Clientes",
    description: "Accede aquí para gestionar y visualizar todos tus clientes.",
    icon: <UserOutlined style={{ fontSize: 36, color: "#722ed1" }} />,
    path: "/clientes",
  },
  {
    title: "Proveedores",
    description: "Accede aquí para gestionar y visualizar todos tus proveedores.",
    icon: <TeamOutlined style={{ fontSize: 36, color: "#722ed1" }} />,
    path: "/proveedores",
  },
  {
    title: "Reportes",
    description: "Visualiza reportes de compras, ventas y ganancias.",
    icon: <BarChartOutlined style={{ fontSize: 36, color: "#13c2c2" }} />,
    path: "/reportes",
  },
];

const Home = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100%', 
        width: '100%',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
        paddingTop: 48,
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          marginTop: 0,
          marginBottom: 40,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <Title level={2}>Panel principal ERP</Title>
        <Text type="secondary">
          Selecciona un módulo para comenzar.
        </Text>
        <br /><br />
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          size="large"
        >
          Cerrar sesión
        </Button>
      </Card>

      <Row gutter={[32, 32]} style={{ maxWidth: 900, width: '100%' }} justify="center">
        {modules.map((mod, idx) => (
          <Col xs={24} sm={12} md={8} key={idx}>
            <Card
              hoverable
              style={{ textAlign: 'center', minHeight: 210, cursor: 'pointer' }}
              onClick={() => navigate(mod.path)}
            >
              {mod.icon}
              <Title level={4} style={{ marginTop: 12 }}>{mod.title}</Title>
              <Text>{mod.description}</Text>
              <br />
              <Button
                type="primary"
                style={{ marginTop: 10 }}
                block
                onClick={(e) => { e.stopPropagation(); navigate(mod.path); }}
              >
                Ir a {mod.title}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;