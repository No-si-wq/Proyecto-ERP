export const fetchStores = async () => {
  const res = await fetch("/api/stores"); // URL completa sin proxy
  if (!res.ok) throw new Error("Error al obtener tiendas");
  return res.json();
};

export const createStore = async (data) => {
  const res = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear tienda");
  return res.json();
};

export const fetchInventarioByStore = async (storeId) => {
  const res = await fetch(`/api/products/by-store/${storeId}`);
  if (!res.ok) throw new Error("Error al obtener inventario");
  return res.json();
};
