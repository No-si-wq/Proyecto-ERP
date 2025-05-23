import React from 'react';
import { Table, Button } from 'antd';
import useInventory from '../../hooks/useInventory';

const InventoryList = () => {
  const { products, loading, deleteProduct } = useInventory();

  const columns = [
    { title: 'Nombre', dataIndex: 'name' },
    { title: 'Precio', dataIndex: 'price' },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Button danger onClick={() => deleteProduct(record.id)}>
          Eliminar
        </Button>
      )
    }
  ];

  return <Table dataSource={products} columns={columns} loading={loading} />;
};

export default InventoryList;