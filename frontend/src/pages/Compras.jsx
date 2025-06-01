import React from 'react';
import { Card, Typography, Button } from 'antd';
import { ShoppingCartOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Compras = () => (
  <div
    style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f0f5ff 0%,#f6ffed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    }}
  >
    <Card
      style={{
        maxWidth: 600,
        minWidth: '100vw',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <ShoppingCartOutlined style={{ fontSize: 48, color: "#1890ff" }} />
      <Title level={2}>Compras</Title>
      <Paragraph>
        Administra las compras de productos y proveedores, revisa pedidos y controla gastos.
      </Paragraph>
      <Button type="primary" icon={<PlusOutlined />}>
        Nueva Compra
      </Button>
    </Card>
  </div>
);

export default Compras;