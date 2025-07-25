import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, HomeOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

export default function TaxesPage() {
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

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/taxes?page=${p}&limit=10`);
      const { data, total } = await res.json();
      setData(data);
      setTotal(total);
    } catch {
      message.error("Error al cargar los impuestos");
    } finally {
      setLoading(false);
    }
  };

  const validateClave = async (_, value) => {
    if (!value || editMode) return Promise.resolve(); // Solo validar en modo agregar
    try {
      const res = await fetch(`/api/taxes/check-clave/${value}`);
      const { exists } = await res.json();
      if (exists) {
        Modal.error({
          title: 'Clave duplicada',
          content: `La clave "${value}" ya está registrada.`,
          okText: 'Aceptar'
        });
        return Promise.reject(new Error('La clave ya existe'));
      }
      return Promise.resolve();
    } catch {
      Modal.error({
        title: 'Error de validación',
        content: 'No se pudo verificar la clave en este momento.',
        okText: 'Aceptar'
      });
      return Promise.reject(new Error('Error al validar clave'));
    }
  };

  const handleAdd = async (values) => {
    try {
      await fetch('/api/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      fetchData();
      message.success('Impuesto agregado');
    } catch {
      message.error('Error al agregar impuesto');
    }
  };

  const handleEdit = async (values) => {
    try {
      await fetch(`/api/taxes/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      fetchData(page);
      message.success('Impuesto actualizado');
    } catch {
      message.error('Error al actualizar impuesto');
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
      await fetch(`/api/taxes/${id}`, { method: 'DELETE' });
      message.success('Impuesto eliminado');
      fetchData(page);
      setSelectedRowKeys([]);
    } catch {
      message.error('Error al eliminar impuesto');
    }
  };

const columns = [
  { title: 'Clave', dataIndex: 'clave', key: 'clave' },
  { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
  {
    title: 'Porcentaje',
    dataIndex: 'percent',
    key: 'percent',
    render: (value) => `${(value * 100).toFixed(2)}%`
  }
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
              const res = await fetch('/api/taxes/next-clave');
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
          type: 'checkbox',
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => {
            const selectedKey = newSelectedRowKeys[0];

            if (selectedRowKeys[0] === selectedKey) {
              // Si se vuelve a seleccionar la misma fila, se deselecciona
              setSelectedRowKeys([]);
            } else {
              // Solo se permite seleccionar una
              setSelectedRowKeys(selectedKey ? [selectedKey] : []);
            }
          },
        }}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: setPage,
        }}
      />

      <Modal
        title={editMode ? "Editar impuesto" : "Agregar impuesto"}
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
          <Form.Item name="clave" label="Clave" 
            rules={[
              { required: true, message: 'La clave es obligatoria' },
              { validator: validateClave }
            ]}
          >
            <Input disabled={editMode} />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="percent"
            label="Porcentaje"
            rules={[
              { required: true, message: 'Este campo es obligatorio' },
              {
                type: 'number',
                min: 0,
                max: 1,
                message: 'Debe estar entre 0 y 1 (por ejemplo: 0.16 para 16%)'
              }
            ]}
          >
            <Input type="number" step="0.01" placeholder="Ej: 0.16 para 16%" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
