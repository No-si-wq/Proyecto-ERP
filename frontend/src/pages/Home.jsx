import React from 'react';
import { Button, Typography } from 'antd';

const { Title } = Typography;

const Home = ({ setAuth }) => {

  const handleLogout = () => {
    setAuth(false);
    localStorage.removeItem('token');
    window.location.href = '/login';
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