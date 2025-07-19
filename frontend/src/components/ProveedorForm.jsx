import React from "react";
import { Modal, Form, Input } from "antd";

const ProveedorForm = ({
  visible,
  onCreate,
  onCancel,
  confirmLoading = false,
  initialValues = {}
}) => {
  const [form] = Form.useForm();

  // Cuando el modal se abre, limpia o inicializa los campos
  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      open={visible}
      title="Agregar nuevo proveedor"
      okText="Agregar"
      cancelText="Cancelar"
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onCreate(values);
            // No limpiamos aquí porque el modal se cierra al agregar
          })
          .catch(() => {});
      }}
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Nombre del proveedor"
          rules={[{ required: true, message: "Ingresa el nombre del proveedor" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="contact"
          label="Contacto"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Teléfono"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[{ type: "email", message: "Correo no válido" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="Dirección"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProveedorForm;