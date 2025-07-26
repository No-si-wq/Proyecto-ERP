import { useState, useEffect } from "react";
import { fetchStores } from "../api/storesAPI"; 

export const useTiendas = () => {
  const [treeData, setTreeData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetchStores()
      .then((data) => {
        if (Array.isArray(data)) {
          const tiendas = data.map((tienda) => ({
            title: tienda.nombre,
            key: tienda.clave,  
             icon: "shop",
            children: [
              { title: "Cajas", key: `${tienda.clave}-Cajas`, icon: "appstore" },
              { title: "Inventarios", key: `${tienda.clave}-Inventarios`, icon: "database" },
              { title: "Políticas", key: `${tienda.clave}-Políticas`, icon: "percentage" },
            ],
        }));
          setTreeData(tiendas); 
        } else {
          setError("Los datos recibidos no son válidos."); 
        }
      })
      .catch((err) => {
        setError(err.message); 
        console.error("Error al obtener tiendas:", err); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); 

  return { treeData, loading, error };
};

export default useTiendas;
