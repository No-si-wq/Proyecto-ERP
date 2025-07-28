import { useState, useEffect } from "react";
import { message } from "antd";

// Utilidad para extraer datos de forma segura desde { data, total }
const extractData = (response) =>
  Array.isArray(response?.data) ? response.data : [];

export const useInventario = (storeId) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);

  const fetchProductos = async () => {
    if (!storeId) {
      setProductos([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/inventario/by-store/${storeId}`);
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error("Error al cargar el inventario");
      console.error("Inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias");
      const json = await res.json();
      const data = Array.isArray(json) ? json : extractData(json);
      setCategorias(data);
    } catch (err) {
      message.error("Error al cargar categorías");
      console.error("Categorías:", err);
      setCategorias([]);
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await fetch("/api/taxes");
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : [];
      setTaxOptions(
        data.map((t) => ({
          value: t.id,
          label: `${(t.percent * 100).toFixed(2)}%`,
          percent: t.percent,
        }))
      );
    } catch (err) {
      message.error("Error al cargar impuestos");
      console.error("Impuestos:", err);
      setTaxOptions([]);
    }
  };

  const fetchTiendas = async () => {
    try {
      const res = await fetch("/api/stores");
      const tiendas = await res.json();
      if (!Array.isArray(tiendas)) throw new Error("Respuesta inválida");

      const formateadas = tiendas.map((tienda) => ({
        title: tienda.nombre,
        key: `${tienda.id}`,
        icon: "shop",
        children: [
          { title: "Cajas", key: `${tienda.id}-Cajas`, icon: "appstore" },
          { title: "Inventarios", key: `${tienda.id}-Inventarios`, icon: "database" },
          { title: "Políticas", key: `${tienda.id}-Políticas`, icon: "percentage" },
        ],
      }));

      setTreeData(formateadas);
    } catch (error) {
      console.error("Tiendas:", error);
      setTreeData([]);
    }
  };

  useEffect(() => {
    if (!storeId) {
      setProductos([]);
      setCategorias([]);
      setTaxOptions([]);
      setTreeData([]);
      return;
    }

    fetchProductos();
    fetchCategorias();
    fetchTaxes();
    fetchTiendas();
  }, [storeId]);

  return {
    productos,
    categorias,
    taxOptions,
    loading,
    fetchProductos,
    treeData,
  };
};