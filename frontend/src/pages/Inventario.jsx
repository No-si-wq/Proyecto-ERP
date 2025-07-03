import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Tabs, Space, Tooltip, Select } from "antd";
import {
  PlusOutlined, DeleteOutlined, HomeOutlined, EditOutlined, FilePdfOutlined, ReloadOutlined,
  AppstoreOutlined, SearchOutlined, TeamOutlined, SettingOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

const Inventario = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Obtener productos y categorías al cargar la página
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  // Trae los productos
  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setProductos(data);
    } catch {
      message.error("Error al cargar el inventario");
    }
    setLoading(false);
  };

  // Trae las categorías
  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      setCategorias(data);
    } catch {
      message.error('Error al cargar categorías');
    }
  };

  // Crear producto
  const onCreate = async (values) => {
    try {
      // categoryId debe ser número
      const dataToSend = {
        ...values,
        categoryId: Number(values.categoryId)
      };
      await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      message.success("Producto añadido");
      setModalVisible(false);
      form.resetFields();
      fetchProductos();
    } catch {
      message.error("No se pudo añadir el producto");
    }
  };

  // Eliminar producto
  const onDelete = async (id) => {
    try {
      await fetch(`/api/inventario/${id}`, { method: "DELETE" });
      message.success("Producto eliminado");
      fetchProductos();
    } catch {
      message.error("No se pudo eliminar el producto");
    }
  };

  // Mostrar nombre de la categoría en la tabla
  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    { title: "Precio", dataIndex: "price", key: "price", render: (value) => `$${value.toFixed(2)}` },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (category) => category?.name || "Sin categoría"
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(record.id)}>
          Eliminar
        </Button>
      ),
    },
  ];

  // Ribbon de acciones (puedes personalizar los tabs)
  const ribbonActions = (
    <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 16 }}>
      <TabPane tab={<span><AppstoreOutlined />Archivo</span>} key="1">
        <Space>
          <Tooltip title="Ir al inicio">
            <Button icon={<HomeOutlined />} onClick={() => navigate('/home')}>Inicio</Button>
          </Tooltip>
          <Tooltip title="Agregar producto">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Añadir
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar inventario">
            <Button icon={<ReloadOutlined />} onClick={fetchProductos}>Actualizar</Button>
          </Tooltip>
          <Tooltip title="Exportar PDF">
            <Button icon={<FilePdfOutlined />}>PDF</Button>
          </Tooltip>
        </Space>
      </TabPane>
      <TabPane tab={<span><TeamOutlined />Catálogos</span>} key="2">
        <Space>
          <Button icon={<SearchOutlined />}>Buscar</Button>
          <Button icon={<EditOutlined />}>Editar</Button>
        </Space>
      </TabPane>
      <TabPane tab={<span><SettingOutlined />Configuración</span>} key="3">
        <Space>
          <Button icon={<SettingOutlined />}>Opciones</Button>
        </Space>
      </TabPane>
    </Tabs>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 1200 }}>
        {ribbonActions}
        <Table
          columns={columns}
          dataSource={productos}
          loading={loading}
          rowKey="id"
        />
      </div>
      <Modal
        title="Añadir Producto"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre del producto' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU (código único)" rules={[{ required: true, message: 'Ingrese el SKU (código único)' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="Cantidad" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Precio" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} step={0.01} />
          </Form.Item>
          <Form.Item name="categoryId" label="Categoría" rules={[{ required: true, message: 'Seleccione la categoría' }]}>
            <Select placeholder="Seleccione una categoría">
              {categorias.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventario;