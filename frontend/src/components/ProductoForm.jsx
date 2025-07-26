import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";

const ProductoForm = ({
  visible,
  onCancel,
  initialData,
  isEdit = false,
  onSuccess,
  categorias,
  taxOptions,
  storeId
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        sku: initialData.sku,
        quantity: initialData.quantity,
        price_base: (
          initialData.tax?.percent
            ? initialData.price / (1 + initialData.tax.percent)
            : initialData.price
        ).toFixed(2),
        taxId: initialData.tax?.id,
        categoryId: initialData.category?.id
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const getTaxPercent = (id) =>
    taxOptions.find(t => t.value === id)?.percent || 0;

  const onFinish = async (values) => {
    const percent = getTaxPercent(values.taxId);
    const price = Number((values.price_base * (1 + percent)).toFixed(2));
    const payload = {
      ...values,
      price,
      categoryId: Number(values.categoryId)
    };

    try {
      const endpoint = isEdit
        ? `/api/inventario/${initialData.id}`
        : `/api/inventario/by-store/${storeId}`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      message.success(isEdit ? "Producto editado" : "Producto añadido");
      onSuccess();
    } catch {
      message.error(
        isEdit ? "Error al editar producto" : "Error al añadir producto"
      );
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar Producto" : "Añadir Producto"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
      </Form>
    </Modal>
  );
};

export default ProductoForm;