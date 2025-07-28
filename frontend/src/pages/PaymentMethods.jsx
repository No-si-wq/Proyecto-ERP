import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Tabs, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, HomeOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;

export default function PaymentMethods() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [currencies, setCurrencies] = useState([]);
  const navigate = useNavigate();

  // Cargar datos cuando cambia la página
  useEffect(() => {
    fetchData(page);
    fetchCurrencies();
  }, [page]);

  const fetchCurrencies = () => {
  fetch('/api/currencies')
    .then(res => res.json())
    .then(({ data }) => setCurrencies(data));
  };

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

  const validateClave = async (_, value) => {
    if (!value || editMode) return Promise.resolve();
    try {
      const res = await fetch(`/api/payment-methods/check-clave/${value}`);
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
    const { clave, descripcion, tipo, monedaId } = values;
    try {
      await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ clave, descripcion, tipo, monedaId })
      });
      await fetchData();
      setPage(1);
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
    if (!current) return message.warning('Selecciona un registro');
      setEditMode(true);
      form.setFieldsValue(current);
      setModalVisible(true);
    };

  const onDelete = async () => {
    if (!current) return message.warning('Selecciona un registro');
    try {
      await fetch(`/api/payment-methods/${current.id}`, { method: 'DELETE' });
      message.success('Método de pago eliminado');
      fetchData(page);
      setCurrent(null);
    } catch {
      message.error('Error al eliminar');
    }
  };

  const columns = [
    { title: 'Clave', dataIndex: 'clave', key: 'clave' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    {
      title: 'Moneda',
      dataIndex: 'moneda',
      key: 'moneda',
      render: (moneda) => moneda ? `${moneda.descripcion}` : ''
    },
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
        <Button icon={<EditOutlined />} onClick={onEdit} style={{ marginRight: 8 }} disabled={!current}>Editar</Button>
        <Popconfirm title="¿Seguro que deseas eliminar?" onConfirm={onDelete}>
          <Button icon={<DeleteOutlined />} danger style={{ marginRight: 8 }} disabled={!current}>Eliminar</Button>
        </Popconfirm>
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(page)}>Actualizar</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: setPage,
        }}
        onRow={(record) => ({
          onClick: () => {
            setCurrent((prev) => (prev?.id === record.id ? null : record));
          },
        })}
        rowClassName={(record) =>
          current?.id === record.id ? 'ant-table-row-selected' : ''
        }
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
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="monedaId" label="Moneda" rules={[{ required: true }]}>
            <Select placeholder="Seleccione una moneda">
              {currencies.map(moneda => (
                <Option key={moneda.id} value={moneda.id}>
                  {moneda.descripcion}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
