import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      setCategorias(data);
    } catch {
      message.error('Error al cargar categorías');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategorias(); }, []);

  const handleSave = async (values) => {
    try {
      if (editing) {
        await fetch(`/api/categorias/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Categoría actualizada');
      } else {
        await fetch('/api/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Categoría añadida');
      }
      setModalVisible(false);
      setEditing(null);
      form.resetFields();
      fetchCategorias();
    } catch {
      message.error('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
      message.success('Categoría eliminada');
      fetchCategorias();
    } catch {
      message.error('No se pudo eliminar la categoría');
    }
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Space>
          <Button onClick={() => { setEditing(record); setModalVisible(true); form.setFieldsValue({ name: record.name }); }}>
            Editar
          </Button>
          <Popconfirm title="¿Eliminar esta categoría?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: 'auto' }}>
      <Button type="primary" onClick={() => { setEditing(null); setModalVisible(true); form.resetFields(); }} style={{ marginBottom: 16 }}>
        Añadir Categoría
      </Button>
      <Table columns={columns} dataSource={categorias} loading={loading} rowKey="id" />
      <Modal
        title={editing ? "Editar Categoría" : "Añadir Categoría"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre de la categoría' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categorias;