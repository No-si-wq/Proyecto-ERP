import { Card, Input } from "antd";

const InventarioView = ({ inventario, searchTerm, onSearch }) => {
  const filtered = inventario.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card title="Inventario">
      <Input.Search
        placeholder="Buscar por clave o descripción"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Clave</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Existencias</th>
            <th>Precio público</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No se encontraron productos
              </td>
            </tr>
          ) : (
            filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category?.name || "-"}</td>
                <td>{p.quantity}</td>
                <td>${p.price.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
};

export default InventarioView;