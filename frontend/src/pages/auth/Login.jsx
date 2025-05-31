import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../hooks/AuthProvider';

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

const Login = ({ setAuth }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async ({ username, password }) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        // Puedes guardar el token si tu backend lo devuelve
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setAuth(true);
        localStorage.setItem('auth', 'true');
        navigate('/home');
      } else {
        const data = await response.json();
        setError(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de red o servidor', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Iniciar Sesión</Title>
        </div>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form
          name="login"
          initialValues={{ remember: true }}
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
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Entrar
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;