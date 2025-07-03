import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Tabs, Space, Tooltip } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch {
      message.error("Error al cargar usuarios");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Create usuario
  const onCreate = async (values) => {
    try {
      await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Usuario añadido");
      setModalVisible(false);
      form.resetFields();
      fetchUsuarios();
    } catch {
      message.error("No se pudo añadir el usuario");
    }
  };

  // Delete usuario
  const onDelete = async (id) => {
    try {
      await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      message.success("Usuario eliminado");
      fetchUsuarios();
    } catch {
      message.error("No se pudo eliminar el usuario");
    }
  };

  // Tabla columnas
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Usuario", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Rol", dataIndex: "role", key: "role" },
    { title: "Creado", dataIndex: "createdAt", key: "createdAt", render: (v) => new Date(v).toLocaleString() },
    {
      title: "Acciones",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  // Ribbon de acciones
  const ribbonActions = (
    <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 16 }}>
      <TabPane tab={<span><UserOutlined />Archivo</span>} key="1">
        <Space>
          <Tooltip title="Ir al inicio">
            <Button icon={<HomeOutlined />} onClick={() => navigate('/home')}>Inicio</Button>
          </Tooltip>
          <Tooltip title="Agregar usuario">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Añadir
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar lista">
            <Button icon={<ReloadOutlined />} onClick={fetchUsuarios}>Actualizar</Button>
          </Tooltip>
          <Tooltip title="Exportar PDF">
            <Button icon={<FilePdfOutlined />}>PDF</Button>
          </Tooltip>
        </Space>
      </TabPane>
      <TabPane tab={<span><TeamOutlined />Acciones</span>} key="2">
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
        <Table columns={columns} dataSource={usuarios} loading={loading} rowKey="id" />
      </div>
      <Modal
        title="Añadir Usuario"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="username" label="Usuario" rules={[{ required: true, message: 'Ingrese el nombre de usuario' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { required: true, message: 'Ingrese el correo electrónico' },
            { type: 'email', message: 'Ingrese un correo válido' }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Ingrese la contraseña' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Seleccione un rol' }]}>
            <Select>
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="facturacion">Facturacion</Select.Option>
              <Select.Option value="ventas">Ventas</Select.Option>
              <Select.Option value="contabilidad">Contabilidad</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Usuarios;