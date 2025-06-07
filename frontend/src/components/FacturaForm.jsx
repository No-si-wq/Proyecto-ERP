import React, { useState } from 'react';
import { Form, Input, Button, Table, Select, InputNumber, message } from 'antd';
import axios from 'axios';

const FacturaForm = ({ productos }) => {
  const [items, setItems] = useState([]);
  const [client, setClient] = useState('');

  const addItem = (productId, quantity) => {
    const producto = productos.find(p => p.id === productId);
    if (!producto) return;
    const price = producto.price;
    const subtotal = price * quantity;
    setItems([...items, { productId, quantity, price, subtotal, name: producto.name }]);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/invoices', {
        client,
        items: items.map(({ productId, quantity, price, subtotal }) => ({
          productId, quantity, price, subtotal
        }))
      });
      message.success('Factura creada exitosamente');
      setItems([]);
      setClient('');
    } catch {
      message.error('Error al crear la factura');
    }
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item label="Cliente" required>
        <Input value={client} onChange={e => setClient(e.target.value)} />
      </Form.Item>
      {/* Aquí agrega un select para productos y campo de cantidad */}
      {/* Ejemplo de tabla de items seleccionados */}
      <Table dataSource={items} columns={[
        { title: 'Producto', dataIndex: 'name' },
        { title: 'Cantidad', dataIndex: 'quantity' },
        { title: 'Precio', dataIndex: 'price' },
        { title: 'Subtotal', dataIndex: 'subtotal' },
      ]} rowKey="productId" pagination={false} />
      <Button type="primary" htmlType="submit">Crear Factura</Button>
    </Form>
  );
};

export default FacturaForm;