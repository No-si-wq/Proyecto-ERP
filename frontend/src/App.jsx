import { useState, useEffect } from 'react';
import { Button, DatePicker, version, List } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/todos');
        setTodos(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {/* Componentes de Ant Design del paso 3 */}
      <h1>antd v{version}</h1>
      <Button type="primary" icon={<UserOutlined />}>
        Button
      </Button>
      <DatePicker />

      {/* Listado de Todos conectado al backend */}
      <h2 style={{ marginTop: 30 }}>Todos:</h2>
      <List
        bordered
        dataSource={todos}
        renderItem={item => (
          <List.Item>
            {item.title} - {item.completed ? "Correcto" : "error"}
          </List.Item>
        )}
      />
    </div>
  );
}

export default App;