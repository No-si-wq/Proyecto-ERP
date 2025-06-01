import React from 'react';
import { Card, Typography, Button } from 'antd';
import { DollarOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Ventas = () => (
  <div
    style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: 'linear-gradient(135deg,#e6f7ff 0%,#fffbe6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    }}
  >
    <Card
      style={{
        maxWidth: 600,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <DollarOutlined style={{ fontSize: 48, color: "#52c41a" }} />
      <Title level={2}>Ventas</Title>
      <Paragraph>
        Aquí puedes gestionar todas las operaciones de ventas, registrar nuevas ventas y ver el historial.
      </Paragraph>
      <Button type="primary" icon={<PlusOutlined />}>
        Nueva Venta
      </Button>
    </Card>
  </div>
);

export default Ventas;