import { useAuth } from './AuthProvider';

export function usePermissions() {
  const { auth } = useAuth();

  const role = auth?.role;

  return {
    canDeletepaymentMethods: role === 'admin',
    canDeleteTaxes: role === 'admin',
    canDeleteMonedas: role === 'admin',
    canDeleteCategorias: role === 'admin',
    canDeleteClientes: role === 'admin',
    canDeleteProveedores: role === 'admin',
    // ...otros permisos
  };
}
