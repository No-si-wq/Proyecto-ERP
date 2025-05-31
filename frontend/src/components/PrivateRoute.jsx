import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTokenValidation } from '../utils/useTokenValidation';

const PrivateRoute = ({ children }) => {
  const isValid = useTokenValidation();

  if (isValid === null) {
    // Puedes mostrar un loader aquí
    return <div>Cargando...</div>;
  }

  return isValid ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;