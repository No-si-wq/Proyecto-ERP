import { useEffect, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../hooks/AuthProvider';

export function useTokenValidation() {
  const [isValid, setIsValid] = useState(null);
  const { setAuth } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuth(null);
      setIsValid(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.clear();
        setAuth(null);
        setIsValid(false);
        return;
      }

      // Si el token aún no está expirado, validamos con el backend
      fetch('http://localhost:5000/api/auth/validate', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();

            // Guardamos en localStorage los datos útiles
            localStorage.setItem('user', data.username);
            localStorage.setItem('role', data.role || '');
            localStorage.setItem('auth', 'true');

            setAuth({
              token,
              user: data.username,
              role: data.role,
              userId: data.userId,
            });

            setIsValid(true);
          } else {
            localStorage.clear();
            setAuth(null);
            setIsValid(false);
          }
        })
        .catch(() => {
          localStorage.clear();
          setAuth(null);
          setIsValid(false);
        });

    } catch (err) {
      // Si el token no es válido (malformado)
      localStorage.clear();
      setAuth(null);
      setIsValid(false);
    }
  }, [setAuth]);

  return isValid;
}