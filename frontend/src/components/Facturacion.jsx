import { Table, Button, notification } from 'antd';
import api from '../services/api';

const Facturacion = () => {
  const [items, setItems] = useState([]);

  const finalizarVenta = async () => {
    try {
      const response = await api.post('/invoices', { items });
      notification.success({ message: 'Venta registrada', description: response.data.folio });
      setItems([]);
    } catch (error) {
      notification.error({ message: 'Error en venta', description: error.message });
    }
  };

  return (
    <>
      <Table dataSource={items} columns={COLUMNAS} />
      <Button type="primary" onClick={finalizarVenta}>Finalizar Venta</Button>
    </>
  );
};