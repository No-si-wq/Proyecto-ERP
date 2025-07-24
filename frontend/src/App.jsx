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
import Clientes from "./pages/Clientes";
import Reportes from "./pages/Reportes";
import Proveedores from "./pages/Proveedores";
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './hooks/AuthProvider';
import Categorias from './pages/Categorias';
import Usuarios from './pages/Usuarios';
import PanelVentas from './pages/PanelVentas';
import FacturasCompras from "./pages/FacturasCompras";
import PaymentMethods from './pages/PaymentMethods';
import CurrencyPage from './pages/CurrencyPage';
import TaxesPage from './pages/TaxesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
          <Route path="/compras" element={<PrivateRoute><Compras /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
          <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/ventas/panel" element={<PrivateRoute><PanelVentas /></PrivateRoute>} />
          <Route path="/compras/facturas" element={<PrivateRoute><FacturasCompras /></PrivateRoute>} />
          <Route path='/formas-pago' element={<PrivateRoute><PaymentMethods /></PrivateRoute>} />
          <Route path='/monedas' element={<PrivateRoute><CurrencyPage/></PrivateRoute>} />
          <Route path='/impuestos' element={<PrivateRoute><TaxesPage/></PrivateRoute>} />
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