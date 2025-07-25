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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCaja, setSelectedCaja] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
    const [stores, setStores] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchCajas = async () => {
    try {
      const { data } = await axios.get("/api/cash-registers");
      setCajas(data);
    } catch (err) {
      message.error("Error al cargar cajas", err);
    }
  };

    const fetchStores = async () => {
      const res = await axios.get("/api/stores"); // tu endpoint real aquí
      setStores(res.data);
    };

  useEffect(() => {
    fetchCajas();
    fetchStores();
  }, []);

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
    } catch (err) {
      message.error("Error al actualizar caja", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/cash-registers/${selectedCaja.id}`);
      message.success("Caja eliminada");
      fetchCajas();
      setSelectedCaja(null);
      setSelectedRowKeys([]);
    } catch (err) {
      message.error("Error al eliminar caja", err);
    }
  };

  const openAddModal = async () => {
    setEditMode(false);
    setSelectedCaja(null);
    form.resetFields();

    try {
      const res = await axios.get("/api/cash-registers/next-clave");
      form.setFieldsValue({ numeroDeCaja: res.data.clave });
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
    });
    setModalVisible(true);
  };

  const onFinish = async (values) => {
    const valuesToSend = {
      ...values,
      numeroDeCaja: Number(values.numeroDeCaja) // fuerza tipo number
    };
    if (editMode) {
      await handleEdit(values);
    } else {
      await handleAdd(values);
    }
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Número de Caja", dataIndex: "numeroDeCaja", key: "numeroDeCaja" },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
    { title: "Formato Nota", dataIndex: "formatoNota", key: "formatoNota" },
    { title: "Formato CFDI", dataIndex: "formatoCFDI", key: "formatoCFDI" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1" style={{ marginBottom: 20 }}>
        <TabPane tab="Archivo" key="1" />
        <TabPane tab="Catálogos" key="2" />
        <TabPane tab="Configuración" key="3" />
      </Tabs>

      <div style={{ marginBottom: 16 }}>
        <Button icon={<HomeOutlined />} onClick={() => navigate("/home")} style={{ marginRight: 8 }}>
          Inicio
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          style={{ marginRight: 8 }}
        >
          Añadir
        </Button>
        <Button
          icon={<EditOutlined />}
          onClick={openEditModal}
          disabled={!selectedCaja}
          style={{ marginRight: 8 }}
        >
          Editar
        </Button>
        <Popconfirm title="¿Seguro que deseas eliminar esta caja?" onConfirm={handleDelete}>
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={!selectedCaja}
            style={{ marginRight: 8 }}
          >
            Eliminar
          </Button>
        </Popconfirm>
        <Button icon={<ReloadOutlined />} onClick={fetchCajas}>
          Actualizar
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={cajas}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: (keys, rows) => {
            if (keys[0] === selectedRowKeys[0]) {
              setSelectedRowKeys([]);
              setSelectedCaja(null);
            } else {
              setSelectedRowKeys([keys[0]]);
              setSelectedCaja(rows[0]);
            }
          },
        }}
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
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="numeroDeCaja"
            label="Número de Caja"
            validateTrigger="onBlur"
              rules={[
                { required: true, message: "Número de caja requerido" },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    if (editMode) return Promise.resolve(); // no validar en modo edición

                    try {
                      const res = await axios.get(`/api/cash-registers/exists/${value}`);
                      if (res.data.exists) {
                        return Promise.reject(new Error("La clave de la caja ya existe"));
                      }
                    } catch {
                      return Promise.reject(new Error("Error al verificar la clave"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
          >
            <Input type="number" disabled={editMode} />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: "Descripción requerida" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="formatoNota"
            label="Formato Nota"
            rules={[{ required: true, message: "Formato de nota requerido" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="formatoCFDI"
            label="Formato CFDI"
            rules={[{ required: true, message: "Formato CFDI requerido" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="storeId"
            label="Tienda"
            rules={[{ required: true, message: "Seleccione una tienda" }]}
          >
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