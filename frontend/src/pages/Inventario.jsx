import React from 'react';
import { Card, Typography, Button } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Inventario = () => (
  <div
    style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: 'linear-gradient(135deg,#fffbe6 0%,#e6fffb 100%)',
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
      <AppstoreOutlined style={{ fontSize: 48, color: "#faad14" }} />
      <Title level={2}>Inventario</Title>
      <Paragraph>
        Consulta el stock disponible, registra nuevas existencias y mantén tu inventario actualizado.
      </Paragraph>
      <Button type="primary" icon={<PlusOutlined />}>
        Nuevo Producto
      </Button>
    </Card>
  </div>
);

export default Inventario;