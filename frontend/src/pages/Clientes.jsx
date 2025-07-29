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
import { usePermissions } from "../hooks/Permisos";

const { TabPane } = Tabs;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const { canDeleteClientes } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch {
      message.error("Error al cargar clientes");
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditMode(false);
    setSelectedCliente(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = () => {
    if (!selectedCliente) return;
    setEditMode(true);
    form.setFieldsValue({
      name: selectedCliente.name,
      rtn: selectedCliente.rtn,
      email: selectedCliente.email,
      phone: selectedCliente.phone,
      address: selectedCliente.address,
    });
    setModalVisible(true);
  };

  const onDelete = () => {
    if (!selectedCliente) return;
    Modal.confirm({
      title: "¿Está seguro que desea eliminar el cliente?",
      content: `Cliente: ${selectedCliente.name}`,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await fetch(`/api/clientes/${selectedCliente.id}`, {
            method: "DELETE",
          });
          message.success("Cliente eliminado");
          setSelectedCliente(null);
          fetchClientes();
        } catch {
          message.error("No se pudo eliminar el cliente");
        }
      },
    });
  };

  const onFinish = async (values) => {
    if (editMode && selectedCliente) {
      // Editar
      try {
        await fetch(`/api/clientes/${selectedCliente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Cliente actualizado");
      } catch {
        message.error("No se pudo editar el cliente");
      }
    } else {
      // Crear
      try {
        await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Cliente añadido");
      } catch {
        message.error("No se pudo añadir el cliente");
      }
    }

    setModalVisible(false);
    form.resetFields();
    setSelectedCliente(null);
    fetchClientes();
  };

  const columns = [
    { title: "Código", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "RTN", dataIndex: "rtn", key: "rtn" },
    { title: "Correo", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
    { title: "Dirección", dataIndex: "address", key: "address" },
  ];

  const ribbonActions = (
    <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 16 }}>
      <TabPane tab={<span><AppstoreOutlined /> Archivo</span>} key="1">
        <Space wrap>
          <Tooltip title="Ir al inicio">
            <Button icon={<HomeOutlined />} onClick={() => navigate("/home")}>
              Inicio
            </Button>
          </Tooltip>
          <Tooltip title="Agregar cliente">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Añadir
            </Button>
          </Tooltip>
          <Tooltip title="Editar cliente">
            <Button icon={<EditOutlined />} disabled={!selectedCliente} onClick={openEditModal}>
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar cliente">
            <Button danger icon={<DeleteOutlined />} disabled={!selectedCliente} 
            hidden={!canDeleteClientes} onClick={onDelete}>
              Eliminar
            </Button>
          </Tooltip>
          <Tooltip title="Actualizar">
            <Button icon={<ReloadOutlined />} onClick={fetchClientes}>
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
      <div style={{ maxWidth: 1200, margin: "0 auto", background: "#f9f9f9", borderRadius: 8, padding: 16, boxShadow: "0 2px 8px #dbeafe50" }}>
        {ribbonActions}
        <Table
          columns={columns}
          dataSource={clientes}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => setSelectedCliente(record),
          })}
          rowClassName={(record) => (selectedCliente?.id === record.id ? "ant-table-row-selected" : "")}
          style={{ background: "white", borderRadius: 4 }}
        />
      </div>

      <Modal
        title={editMode ? "Editar Cliente" : "Añadir Cliente"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedCliente(null);
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rtn" label="RTN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Correo">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Teléfono" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Dirección" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clientes;