// components/Inventory.jsx
import { Table, Button, Space } from 'antd';

const Inventory = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);

  const columns = [
    { title: 'Nombre', dataIndex: 'name' },
    { title: 'Precio', dataIndex: 'price' },
    { title: 'Existencia', dataIndex: 'quantity' },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Space>
          <Button>Editar</Button>
          <Button danger>Eliminar</Button>
        </Space>
      )
    }
  ];

  return <Table dataSource={products} columns={columns} />;
};