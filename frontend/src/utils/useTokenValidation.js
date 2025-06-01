import { useEffect, useState } from 'react';

export function useTokenValidation() {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsValid(false);
      return;
    }

    fetch('http://localhost:5000/api/auth/validate', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        setIsValid(false);
        localStorage.removeItem('token');
      });
  }, []);

  return isValid;
}