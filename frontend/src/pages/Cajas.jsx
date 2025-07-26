import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tabs,
  message,
  Space,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;
const Cajas = () => {
  const [cajas, setCajas] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedCaja, setSelectedCaja] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCajas();
    fetchStores();
  }, []);

  const fetchCajas = async () => {
    try {
      const storeId = 1; // por ejemplo, la tienda actual o la primera
      const { data } = await axios.get(`/api/cash-registers/por-tienda/${storeId}`);
      setCajas(data);
    } catch (err) {
      message.error("Error al cargar cajas", err);
    }
  };

  const fetchStores = async () => {
    try {
      const { data } = await axios.get("/api/stores");
      setStores(data);
    } catch {
      message.error("Error al cargar tiendas");
    }
  };

  const validateClave = async (_, value) => {
    if (!value || editMode) return Promise.resolve(); // Solo validar en modo agregar

    try {
      const res = await fetch(`/api/cash-registers/check-clave/${value}`);
      const { exists } = await res.json();
      if (exists) {
        Modal.error({
          title: 'Numero duplicada',
          content: `El numero "${value}" ya está registrado.`,
          okText: 'Aceptar'
        });
        return Promise.reject(new Error('El numero ya existe'));
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
      await axios.post("/api/cash-registers", values);
      message.success("Caja creada");
      fetchCajas();
    } catch (err) {
      message.error("Error al crear caja", err);
    }
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`/api/cash-registers/${selectedCaja.id}`, values);
      message.success("Caja actualizada");
      fetchCajas();
    } catch {
      message.error("Error al actualizar caja");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/cash-registers/${selectedCaja.id}`);
      message.success("Caja eliminada");
      fetchCajas();
      setSelectedCaja(null);
    } catch {
      message.error("Error al eliminar caja");
    }
  };

  const openAddModal = async () => {
    setEditMode(false);
    setSelectedCaja(null);
    form.resetFields();

    try {
      const { data } = await axios.get("/api/cash-registers/next-clave");
      form.setFieldsValue({ numeroDeCaja: data.clave });
    } catch {
      message.error("No se pudo obtener el número de caja");
    }

    setModalVisible(true);
  };

  const openEditModal = () => {
    if (!selectedCaja) return;
    setEditMode(true);
    form.setFieldsValue({
      numeroDeCaja: selectedCaja.numeroDeCaja,
      descripcion: selectedCaja.descripcion,
      formatoNota: selectedCaja.formatoNota,
      formatoCFDI: selectedCaja.formatoCFDI,
      storeId: selectedCaja.storeId,
    });
    setModalVisible(true);
  };

  const onFinish = async (values) => {
    const formatted = {
      ...values,
      numeroDeCaja: Number(values.numeroDeCaja),
    };
    editMode ? await handleEdit(formatted) : await handleAdd(formatted);
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Número de Caja", dataIndex: "numeroDeCaja" },
    { title: "Descripción", dataIndex: "descripcion" },
    { title: "Formato Nota", dataIndex: "formatoNota" },
    { title: "Formato CFDI", dataIndex: "formatoCFDI" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Archivo" key="1" />
        <TabPane tab="Catálogos" key="2" />
        <TabPane tab="Configuración" key="3" />
      </Tabs>

      <Space style={{ marginBottom: 16 }}>
        <Button icon={<HomeOutlined />} onClick={() => navigate("/home")}>Inicio</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Añadir</Button>
        <Button icon={<EditOutlined />} disabled={!selectedCaja} onClick={openEditModal}>Editar</Button>
        <Popconfirm
          title="¿Seguro que deseas eliminar esta caja?"
          onConfirm={handleDelete}
          okText="Sí"
          cancelText="No"
        >
          <Button icon={<DeleteOutlined />} danger disabled={!selectedCaja}>Eliminar</Button>
        </Popconfirm>
        <Button icon={<ReloadOutlined />} onClick={fetchCajas}>Actualizar</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={cajas}
        onRow={(record) => ({
          onClick: () => setSelectedCaja(record),
        })}
        rowClassName={(record) => (selectedCaja?.id === record.id ? "ant-table-row-selected" : "")}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={modalVisible}
        title={editMode ? "Editar Caja" : "Agregar Caja"}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="numeroDeCaja"
            label="Número de Caja"
            rules={[
              { required: true, message: 'El número de caja es obligatorio' },
              { validator: validateClave }
            ]}
          >
            <Input type="number" disabled={editMode} />
          </Form.Item>

          <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="formatoNota" label="Formato Nota" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="formatoCFDI" label="Formato CFDI" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="storeId" label="Tienda" rules={[{ required: true }]}>
            <Select placeholder="Seleccione una tienda">
              {stores.map((store) => (
                <Select.Option key={store.id} value={store.id}>
                  {store.nombre}
                </Select.Option>
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
};

export default Cajas;