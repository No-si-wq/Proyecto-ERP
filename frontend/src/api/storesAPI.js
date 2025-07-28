export const fetchStores = async () => {
  const res = await fetch("/api/stores"); 
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

export const fetchStoreById = async (id) => {
  const res = await fetch(`/api/stores/${id}`);
  if (!res.ok) throw new Error("Error al obtener la tienda");
  return res.json(); 
};

export const updateStore = async (id, data) => {
  const res = await fetch(`/api/stores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar tienda");
  return res.json();
};

export const deleteStore = async (id) => {
  const res = await fetch(`/api/stores/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar tienda");
};

export const fetchInventarioByStore = async (storeId) => {
  const res = await fetch(`/api/inventario/by-store/${storeId}`);
  if (!res.ok) throw new Error("Error al obtener inventario");
  return res.json();
};

export const fetchCajasByStore = async (storeId) => {
  const res = await fetch(`/api/cash-registers/by-store/${storeId}`);
  if (!res.ok) throw new Error("Error al obtener Cajas");
  return res.json();
};
