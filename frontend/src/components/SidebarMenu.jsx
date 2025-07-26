import { useState } from "react";
import {
  Tree,
  Button,
  Typography,
  Space,
  Divider,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchStoreById } from "../api/storesAPI";
import { updateStore } from "../api/storesAPI";
import { deleteStore } from "../api/storesAPI";

const { Title } = Typography;

const SidebarMenu = ({
  treeData,
  onSelect,
  onCreate,
  selectedKey,
  selectedStoreId,
  onReload,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const isStoreKeySelected = selectedKey?.startsWith("store-");
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const validateClave = async (_, value) => {
    if (!value || editMode) return Promise.resolve();
    try {
      const res = await fetch(`/api/stores/check-clave/${value}`);
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

  const handleCreateClick = async () => {
    form.resetFields();
    try {
      const res = await fetch('/api/stores/next-clave');
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${errorBody}`);
      }
      const { clave } = await res.json();
      form.setFieldsValue({ clave });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al obtener la clave:', error);
      message.error('Error al obtener la clave');
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onCreate(values);
      message.success("Tienda creada con éxito");
      setIsModalOpen(false);
      if (onReload) onReload();
    } catch (error) {
      console.error(error);
      message.error("Error al crear tienda");
    }
  };

  const handleEdit = async () => {
    if (!selectedStoreId) {
      return message.warning("Seleccione una tienda para editar.");
    }

  try {
    const tienda = await fetchStoreById(selectedStoreId);

    if (!tienda) {
      return message.error("Tienda no encontrada");
    }

    form.setFieldsValue({
      nombre: tienda.nombre,
      clave: tienda.clave,
      direccion: tienda.direccion || "",
      telefono: tienda.telefono || "",
    });

    setEditModalVisible(true);
  } catch (error) {
    console.error("Error al cargar datos de tienda:", error);
    message.error("No se pudo cargar la tienda");
  }
};

  const submitEdit = async () => {
    try {
      const values = await form.validateFields();
      await updateStore(selectedStoreId, values);
      message.success("Tienda actualizada");
      setEditModalVisible(false);
      if (onReload) onReload();
    } catch (err) {
      message.error("Error al actualizar tienda");
    }
  };

  const handleDelete = () => {
    if (!selectedStoreId) {
      return message.warning("Seleccione una tienda para eliminar.");
    }
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteStore(selectedStoreId);
      message.success("Tienda eliminada");
      setDeleteConfirmVisible(false);
      if (onReload) onReload();
    } catch {
      message.error("Error al eliminar tienda");
    }
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button icon={<HomeOutlined />} block onClick={() => navigate("/home")}>
          Inicio
        </Button>

        <Divider style={{ margin: "8px 0" }} />

        <Title level={5} style={{ marginBottom: 0 }}>
          Tiendas
        </Title>

        <Tree
          showIcon
          defaultExpandAll
          selectedKeys={[selectedKey]}
          onSelect={onSelect}
          treeData={treeData}
          style={{ marginBottom: 8 }}
        />

        <Space style={{ justifyContent: "center", width: "100%" }}>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleCreateClick}
            title="Crear tienda"
          />
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            title="Editar tienda"
            disabled={!isStoreKeySelected}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={handleDelete}
            title="Eliminar tienda"
            disabled={!isStoreKeySelected}
          />
        </Space>
      </Space>

      {/* Modal de creación */}
      <Modal
        open={isModalOpen}
        title="Crear nueva tienda"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateSubmit}
        okText="Crear"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="clave" label="Clave" 
            rules={[
              { required: true, message: 'La clave es obligatoria' },
              { validator: validateClave }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de edición */}
      <Modal
        open={editModalVisible}
        title="Editar tienda"
        onCancel={() => setEditModalVisible(false)}
        onOk={submitEdit}
        okText="Guardar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="clave" label="Clave" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección">
            <Input />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        open={deleteConfirmVisible}
        title="Eliminar tienda"
        onCancel={() => setDeleteConfirmVisible(false)}
        onOk={confirmDelete}
        okType="danger"
        okText="Eliminar"
      >
        ¿Estás seguro de que deseas eliminar esta tienda?
      </Modal>
    </div>
  );
};

export default SidebarMenu;