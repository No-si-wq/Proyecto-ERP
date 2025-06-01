import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider'; // Ajusta la ruta si es necesario

const { Title } = Typography;

const Home = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Title>Bienvenido a la página de inicio</Title>
      <Button type="primary" danger onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
};

export default Home;