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
import Facturas from "./pages/Factura";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './hooks/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PrivateRoute><Login /></PrivateRoute>} />
          <Route path="/register" element={<PrivateRoute><Register /></PrivateRoute>} />
          <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
          <Route path="/compras" element={<PrivateRoute><Compras /></PrivateRoute>} />
          <Route path="/facturas" element={<PrivateRoute><Facturas /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
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