import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, HomeOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

export default function PaymentMethods() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // 🔁 Cargar datos cuando cambia la página
  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment-methods?page=${p}&limit=10`);
      const { data, total } = await res.json();
      setData(data);
      setTotal(total);
    } catch (error) {
      message.error("Error al cargar el inventario", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values) => {
    try {
      await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      await fetchData(); 
      setPage(); 
      message.success('Método de pago agregado');
    } catch {
      message.error('Error al agregar método de pago');
    }
  };

  const handleEdit = async (values) => {
    try {
      await fetch(`/api/payment-methods/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      fetchData(page);
      message.success('Método de pago actualizado');
    } catch {
      message.error('Error al actualizar método de pago');
    }
  };

  const onEdit = () => {
    const selected = data.find(item => item.id === selectedRowKeys[0]);
    if (!selected) return message.warning('Selecciona un registro');
    setEditMode(true);
    setCurrent(selected);
    form.setFieldsValue(selected);
    setModalVisible(true);
  };

  const onDelete = async () => {
    const id = selectedRowKeys[0];
    if (!id) return message.warning('Selecciona un registro');
    try {
      await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      message.success('Método de pago eliminado');
      fetchData(page);
      setSelectedRowKeys([]);
    } catch {
      message.error('Error al eliminar');
    }
  };

  const columns = [
    { title: 'Clave', dataIndex: 'clave', key: 'clave' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Moneda', dataIndex: 'moneda', key: 'moneda' },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1" style={{ marginBottom: 20 }}>
        <TabPane tab="Archivo" key="1" />
        <TabPane tab="Catálogos" key="2" />
        <TabPane tab="Configuración" key="3" />
      </Tabs>

      <div style={{ marginBottom: 16 }}>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/home')} style={{ marginRight: 8 }}>Inicio</Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={async () => {
            setEditMode(false);
            setCurrent(null);
            form.resetFields();
            try {
              const res = await fetch('/api/payment-methods/next-clave');
              const { clave } = await res.json();
              form.setFieldsValue({ clave });
              setModalVisible(true);
            } catch {
              message.error('Error al obtener la clave');
            }
          }}
          style={{ marginRight: 8 }}
        >
          Añadir
        </Button>
        <Button icon={<EditOutlined />} onClick={onEdit} style={{ marginRight: 8 }} disabled={selectedRowKeys.length !== 1}>Editar</Button>
        <Popconfirm title="¿Seguro que deseas eliminar?" onConfirm={onDelete}>
          <Button icon={<DeleteOutlined />} danger style={{ marginRight: 8 }} disabled={selectedRowKeys.length !== 1}>Eliminar</Button>
        </Popconfirm>
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(page)}>Actualizar</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        rowSelection={{
          type: 'radio',
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: setPage,
        }}
      />

      <Modal
        title={editMode ? "Editar método de pago" : "Agregar método de pago"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={async (values) => {
            try {
              if (editMode) {
                await handleEdit(values);
              } else {
                await handleAdd(values);
              }
              setModalVisible(false);
              form.resetFields();
            } catch {
              message.error("Error al guardar los cambios");
            }
          }}
        >
          <Form.Item name="clave" label="Clave" rules={[{ required: true }]}>
            <Input disabled={editMode} />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="moneda" label="Moneda" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
