import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Space,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  HomeOutlined,
  EditOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categorias");
      const data = await res.json();
      setCategorias(data);
    } catch {
      message.error("Error al cargar categorías");
    }
    setLoading(false);
  };

  const onCreate = async (values) => {
    try {
      await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Categoría añadida");
      setModalVisible(false);
      form.resetFields();
      fetchCategorias();
    } catch {
      message.error("No se pudo añadir la categoría");
    }
  };

  const onEdit = async (values) => {
    try {
      await fetch(`/api/categorias/${selectedCategoria.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Categoría editada");
      setModalEditVisible(false);
      setSelectedRowKeys([]);
      setSelectedCategoria(null);
      editForm.resetFields();
      fetchCategorias();
    } catch {
      message.error("No se pudo editar la categoría");
    }
  };

  const onDelete = async () => {
    if (!selectedCategoria) return;
    Modal.confirm({
      title: "¿Está seguro que desea eliminar la categoría?",
      content: `Categoría: ${selectedCategoria.name}`,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await fetch(`/api/categorias/${selectedCategoria.id}`, {
            method: "DELETE",
          });
          message.success("Categoría eliminada");
          setSelectedRowKeys([]);
          setSelectedCategoria(null);
          fetchCategorias();
        } catch {
          message.error("No se pudo eliminar la categoría");
        }
      },
    });
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
  ];

  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      if (
        selectedRowKeys.length > 0 &&
        selectedKeys[0] === selectedRowKeys[0]
      ) {
        setSelectedRowKeys([]);
        setSelectedCategoria(null); // o current/null según el archivo
      } else {
        setSelectedRowKeys(selectedKeys);
        setSelectedCategoria(selectedRows[0] || null);
      }
      if (selectedRows[0]) {
        editForm.setFieldsValue({
          name: selectedRows[0].name,
        });
      }
    },
  };

  const ribbonActions = (
    <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 16 }}>
      <TabPane tab={<span><AppstoreOutlined /> Archivo</span>} key="1">
        <Space>
          <Tooltip title="Ir al inicio">
            <Button icon={<HomeOutlined />} onClick={() => navigate("/home")}>
              Inicio
            </Button>
          </Tooltip>
          <Tooltip title="Agregar categoría">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Añadir
            </Button>
          </Tooltip>
          <Tooltip title="Editar categoría">
            <Button icon={<EditOutlined />} disabled={!selectedCategoria} onClick={() => setModalEditVisible(true)}>
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar categoría">
            <Button danger icon={<DeleteOutlined />} disabled={!selectedCategoria} onClick={onDelete}>
              Eliminar
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar">
            <Button icon={<ReloadOutlined />} onClick={fetchCategorias}>
              Actualizar
            </Button>
          </Tooltip>
        </Space>
      </TabPane>
      <TabPane tab={<span><TeamOutlined /> Catálogos</span>} key="2">
        <Space><Button icon={<SearchOutlined />}>Buscar</Button></Space>
      </TabPane>
      <TabPane tab={<span><SettingOutlined /> Configuración</span>} key="3">
        <Space><Button icon={<SettingOutlined />}>Opciones</Button></Space>
      </TabPane>
    </Tabs>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f5ff 0%, #fffbe6 100%)", padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", background: "#e7eaf6", borderRadius: 8, padding: 16, boxShadow: "0 2px 8px #dbeafe50" }}>
        {ribbonActions}
        <Table
          columns={columns}
          dataSource={categorias}
          loading={loading}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{ pageSize: 10 }}
          style={{ background: "white", borderRadius: 4 }}
        />
      </div>

      <Modal
        title="Añadir Categoría"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Ingrese el nombre de la categoría" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Editar Categoría"
        open={modalEditVisible}
        onCancel={() => {
          setModalEditVisible(false);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        destroyOnClose
      >
        <Form form={editForm} onFinish={onEdit} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Ingrese el nombre de la categoría" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categorias;