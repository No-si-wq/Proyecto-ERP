import { useState, useEffect } from "react";
import { message } from "antd";

export const useInventario = (storeId) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);

    const fetchProductos = async () => {
    if (!storeId) {
        // Si no hay storeId válido, no hacemos la petición y limpiamos productos
        setProductos([]);
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(`/api/inventario/by-store/${storeId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProductos(data);
    } catch (err) {
        message.error("Error al cargar el inventario", err);
    }
    setLoading(false);
    };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias");
      const { data } = await res.json();
      setCategorias(data);
    } catch {
      message.error("Error al cargar categorías");
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await fetch("/api/taxes");
      const { data } = await res.json();
      setTaxOptions(data.map(t => ({
        value: t.id,
        label: `(${(t.percent * 100).toFixed(2)}%)`,
        percent: t.percent
      })));
    } catch {
      message.error("Error al cargar impuestos");
    }
  };

    const fetchTiendas = async () => {
    try {
      const res = await fetch("/api/stores");
      const tiendas = await res.json();

      const formateadas = tiendas.map((tienda) => ({
        title: tienda.nombre,
        key: `${tienda.id}`, // clave principal es el ID
        icon: "shop",
        children: [
          { title: "Cajas", key: `${tienda.id}-Cajas`, icon: "appstore" },
          { title: "Inventarios", key: `${tienda.id}-Inventarios`, icon: "database" },
          { title: "Políticas", key: `${tienda.id}-Políticas`, icon: "percentage" },
        ],
      }));

      setTreeData(formateadas);
    } catch (error) {
      console.error("Error al cargar tiendas:", error);
    }
  };

    useEffect(() => {
    if (storeId) {
        fetchProductos();
        fetchCategorias();
        fetchTaxes();
        fetchTiendas();
    } else {
        setProductos([]);
        setCategorias([]);
        setTaxOptions([]);
        setTreeData([]);
    }
    }, [storeId]);

  return { productos, categorias, taxOptions, loading, fetchProductos };
};