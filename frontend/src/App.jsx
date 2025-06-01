import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './hooks/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home/>
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;