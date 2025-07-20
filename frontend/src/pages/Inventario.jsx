import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tabs,
  Space,
  Tooltip,
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  HomeOutlined,
  EditOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const Inventario = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

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
      const res = await fetch("/api/categorias");
      const data = await res.json();
      setCategorias(data);
    } catch {
      message.error("Error al cargar categorías");
    }
  };

  // Crear producto
  const onCreate = async (values) => {
    try {
      // categoryId debe ser número
      const dataToSend = {
        ...values,
        categoryId: Number(values.categoryId),
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

  // Editar producto
  const onEdit = async (values) => {
    try {
      const dataToSend = {
        ...values,
        categoryId: Number(values.categoryId),
      };
      await fetch(`/api/inventario/${selectedProducto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      message.success("Producto editado");
      setModalEditVisible(false);
      setSelectedRowKeys([]);
      setSelectedProducto(null);
      editForm.resetFields();
      fetchProductos();
    } catch {
      message.error("No se pudo editar el producto");
    }
  };

  // Eliminar producto
  const onDelete = async () => {
    if (!selectedProducto) return;
    Modal.confirm({
      title: "¿Está seguro que desea eliminar el producto?",
      content: `Producto: ${selectedProducto.name}`,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await fetch(`/api/inventario/${selectedProducto.id}`, {
            method: "DELETE",
          });
          message.success("Producto eliminado");
          setSelectedRowKeys([]);
          setSelectedProducto(null);
          fetchProductos();
        } catch {
          message.error("No se pudo eliminar el producto");
        }
      },
    });
  };

  const TAX_OPTIONS = [
  { value: 'IVA 15%', label: 'IVA 15%' },
  { value: 'IVA 0%', label: 'IVA 0%' },
  { value: 'IVA Exento', label: 'IVA Exento' },
  ];

  // Mostrar nombre de la categoría en la tabla
  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: (value) => `L. ${value.toFixed(2)}`,
    },
    { title: "Impuesto", dataIndex: "tax", key: "tax" },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (category) => category?.name || "Sin categoría",
    },
    // Quitar columna de acciones, ya que ahora los botones están arriba
  ];

  // Selección de fila única
  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedProducto(selectedRows[0] || null);
      // Si se selecciona, llenamos el formulario de edición
      if (selectedRows[0]) {
        editForm.setFieldsValue({
          name: selectedRows[0].name,
          sku: selectedRows[0].sku,
          quantity: selectedRows[0].quantity,
          price: selectedRows[0].price,
          categoryId: selectedRows[0].category?.id,
          tax: selectedRows[0].tax,
        });
      }
    },
  };

  // Ribbon de acciones
  const ribbonActions = (
    <Tabs
      defaultActiveKey="1"
      type="card"
      style={{ marginBottom: 16 }}
      tabBarStyle={{ marginBottom: 0 }}
    >
      <TabPane
        tab={
          <span>
            <AppstoreOutlined />
            Archivo
          </span>
        }
        key="1"
      >
        <br />
        <Space>
          <Tooltip title="Ir al inicio">
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate("/home")}
              style={{ background: "#f5f5f5" }}
            >
              Inicio
            </Button>
          </Tooltip>
          <Tooltip title="Agregar producto">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Añadir
            </Button>
          </Tooltip>
          <Tooltip title="Editar producto">
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={!selectedProducto}
              onClick={() => setModalEditVisible(true)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar producto">
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedProducto}
              onClick={onDelete}
            >
              Eliminar
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar inventario">
            <Button icon={<ReloadOutlined />} onClick={fetchProductos}>
              Actualizar
            </Button>
          </Tooltip>
          <Tooltip title="Exportar PDF">
            <Button icon={<FilePdfOutlined />}>PDF</Button>
          </Tooltip>
        </Space>
      </TabPane>
      <TabPane
        tab={
          <span>
            <TeamOutlined />
            Catálogos
          </span>
        }
        key="2"
      >
        <Space>
          <Button icon={<SearchOutlined />}>Buscar</Button>
        </Space>
      </TabPane>
      <TabPane
        tab={
          <span>
            <SettingOutlined />
            Configuración
          </span>
        }
        key="3"
      >
        <Space>
          <Button icon={<SettingOutlined />}>Opciones</Button>
        </Space>
      </TabPane>
    </Tabs>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          background: "#e7eaf6",
          borderRadius: 8,
          boxShadow: "0 2px 8px #dbeafe50",
          padding: 16,
        }}
      >
        {ribbonActions}
        <Table
          columns={columns}
          dataSource={productos}
          loading={loading}
          rowKey="id"
          size="middle"
          rowSelection={rowSelection}
          pagination={{ pageSize: 12 }}
          style={{ background: "white", borderRadius: 4 }}
        />
      </div>
      {/* Modal para agregar */}
      <Modal
        title="Añadir Producto"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Ingrese el nombre del producto" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sku"
            label="SKU (código único)"
            rules={[
              { required: true, message: "Ingrese el SKU (código único)" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Cantidad"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Precio"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} step={0.01} />
          </Form.Item>

          <Form.Item
            name="tax"
            label="Impuesto"
            rules={[{ required: true, message: "Seleccione el impuesto" }]}
          >
            <Select placeholder="Seleccione impuesto">
              {TAX_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Categoría"
            rules={[{ required: true, message: "Seleccione la categoría" }]}
          >
            <Select placeholder="Seleccione una categoría">
              {categorias.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal para editar */}
      <Modal
        title="Editar Producto"
        open={modalEditVisible}
        onCancel={() => setModalEditVisible(false)}
        onOk={() => editForm.submit()}
        destroyOnClose
      >
        <Form form={editForm} onFinish={onEdit} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Ingrese el nombre del producto" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sku"
            label="SKU (código único)"
            rules={[
              { required: true, message: "Ingrese el SKU (código único)" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Cantidad"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Precio"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} step={0.01} />
          </Form.Item>
          <Form.Item
            name="tax"
            label="Impuesto"
            rules={[{ required: true, message: "Seleccione el impuesto" }]}
          >
            <Select placeholder="Seleccione impuesto">
              {TAX_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Categoría"
            rules={[{ required: true, message: "Seleccione la categoría" }]}
          >
            <Select placeholder="Seleccione una categoría">
              {categorias.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventario;