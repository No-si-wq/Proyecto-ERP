import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Space,
  Tooltip,
} from "antd";
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
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const navigate = useNavigate();

  // Obtener usuarios
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

  // Crear usuario
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

  // Editar usuario
  const onEdit = async (values) => {
    if (!selectedUsuario) return;
    try {
      await fetch(`/api/usuarios/${selectedUsuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      message.success("Usuario actualizado");
      setModalEditVisible(false);
      setSelectedUsuario(null);
      setSelectedRowKeys([]);
      editForm.resetFields();
      fetchUsuarios();
    } catch {
      message.error("No se pudo editar el usuario");
    }
  };

  // Eliminar usuario
  const onDelete = async () => {
    if (!selectedUsuario) return;
    Modal.confirm({
      title: "¿Está seguro que desea eliminar el usuario?",
      content: `Usuario: ${selectedUsuario.username}`,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await fetch(`/api/usuarios/${selectedUsuario.id}`, {
            method: "DELETE",
          });
          message.success("Usuario eliminado");
          setSelectedRowKeys([]);
          setSelectedUsuario(null);
          fetchUsuarios();
        } catch {
          message.error("No se pudo eliminar el usuario");
        }
      },
    });
  };

  // Tabla
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Usuario", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Rol", dataIndex: "role", key: "role" },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => new Date(v).toLocaleString(),
    },
  ];

  // Selección de filas
  const rowSelection = {
    type: "checkbox",
    selectedRowKeys,
    onChange: (newSelectedKeys, selectedRows) => {
      if (
        selectedRowKeys.length === 1 &&
        newSelectedKeys.length === 1 &&
        newSelectedKeys[0] === selectedRowKeys[0]
      ) {
        setSelectedRowKeys([]);
        setSelectedUsuario(null);
        editForm.resetFields();
        return;
      }

      const selectedRow = selectedRows[0];
      const newKey = newSelectedKeys[0] ? [newSelectedKeys[0]] : [];
      setSelectedRowKeys(newKey);
      setSelectedUsuario(selectedRow || null);

      if (selectedRow) {
        editForm.setFieldsValue({
          username: selectedRow.username,
          email: selectedRow.email,
          role: selectedRow.role,
          password: "", // vacío por seguridad
        });
      }
    },
  };

  // Ribbon
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
            <UserOutlined />
            Archivo
          </span>
        }
        key="1"
      >
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
          <Tooltip title="Agregar usuario">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Añadir
            </Button>
          </Tooltip>
          <Tooltip title="Editar usuario">
            <Button
              icon={<EditOutlined />}
              disabled={!selectedUsuario}
              onClick={() => setModalEditVisible(true)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar usuario">
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedUsuario}
              onClick={onDelete}
            >
              Eliminar
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar lista">
            <Button icon={<ReloadOutlined />} onClick={fetchUsuarios}>
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
            Acciones
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
          dataSource={usuarios}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowSelection={rowSelection}
          style={{ background: "white", borderRadius: 4 }}
        />
      </div>

      {/* Modal crear */}
      <Modal
        title="Añadir Usuario"
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
            name="username"
            label="Usuario"
            rules={[{ required: true, message: "Ingrese el nombre de usuario" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Ingrese el correo electrónico" },
              { type: "email", message: "Correo no válido" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: "Ingrese la contraseña" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Seleccione un rol" }]}
          >
            <Select placeholder="Seleccione un rol">
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="facturacion">Facturación</Select.Option>
              <Select.Option value="ventas">Ventas</Select.Option>
              <Select.Option value="contabilidad">Contabilidad</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal editar */}
      <Modal
        title="Editar Usuario"
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
            name="username"
            label="Usuario"
            rules={[{ required: true, message: "Ingrese el nombre de usuario" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Ingrese el correo electrónico" },
              { type: "email", message: "Correo no válido" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Nueva contraseña"
            rules={[{ required: true, message: "Ingrese una nueva contraseña" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Seleccione un rol" }]}
          >
            <Select placeholder="Seleccione un rol">
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="facturacion">Facturación</Select.Option>
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