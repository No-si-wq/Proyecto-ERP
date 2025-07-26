// components/tiendas/CajasView.jsx
import React from "react";
import { Card, Input } from "antd";

const CajasView = ({ cajas, searchTerm, onSearch }) => {
  const filtradas = cajas.filter((caja) =>
    caja.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card title="Cajas">
      <Input.Search
        placeholder="Buscar caja"
        onChange={(e) => onSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      {filtradas.length === 0 ? (
        <p>No hay cajas para esta tienda.</p>
      ) : (
        <ul>
          {filtradas.map((caja) => (
            <li key={caja.id}>
              {caja.nombre} - Estado: {caja.estado}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default CajasView;