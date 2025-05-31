import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const containerStyle = {
  minHeight: '100vh',
  minWidth: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
  padding: '0',
  margin: '0',
  position: 'fixed',
  top: 0,
  left: 0,
};

const cardStyle = {
  width: '100%',
  maxWidth: 350,
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
  padding: '24px 16px',
};

const Register = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async ({ username, email, password }) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al registrar');
      }
    } catch (err) {
      setError('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Registro</Title>
        </div>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 8 }} />}
        {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 8 }} />}
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%' }}
        >
          <Form.Item
            name="username"
            label="Usuario"
            rules={[{ required: true, message: 'Por favor ingresa tu usuario' }]}
            style={{ marginBottom: 16 }}
          >
            <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Por favor ingresa tu correo' },
              { type: 'email', message: 'Correo no válido' }
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input prefix={<MailOutlined />} placeholder="Correo electrónico" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Registrarse
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;