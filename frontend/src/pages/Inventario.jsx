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
  FileExcelOutlined,
  HomeOutlined,
  EditOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { TabPane } = Tabs;


const Inventario = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const exportToExcel = () => {
  const data = productos.map((prod) => ({
    Nombre: prod.name,
    SKU: prod.sku,
    Cantidad: prod.quantity,
    "Precio con impuesto": prod.price.toFixed(2),
    "Precio sin impuesto": (
      prod.tax && prod.tax.percent
        ? prod.price / (1 + prod.tax.percent)
        : prod.price
    ).toFixed(2),
    Impuesto: prod.tax ? `${(prod.tax.percent * 100).toFixed(2)}%` : "0%",
    Categoría: prod.category?.name || "Sin categoría",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "Inventario.xlsx");
};
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [form] = Form.useForm();

  // Para controlar el precio sin impuesto y el precio con impuesto en los formularios
  const [precioBase, setPrecioBase] = useState(0);
  const [precioConImpuesto, setPrecioConImpuesto] = useState(0);
  const [taxOptions, setTaxOptions] = useState([]);

  const [editPrecioBase, setEditPrecioBase] = useState(0);
  const [editPrecioConImpuesto, setEditPrecioConImpuesto] = useState(0);
  const [selectedTax, setSelectedTax] = useState(null);
  const [editSelectedTax, setEditSelectedTax] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [editForm] = Form.useForm();

    useEffect(() => {
    if (selectedProducto && taxOptions.length > 0) {
      const impuesto = taxOptions.find(
        (t) => t.value === selectedProducto.tax?.id
      );

      if (impuesto) {
        const percent = impuesto.percent;
        const base = selectedProducto.price / (1 + percent);

        setEditPrecioBase(Number(base.toFixed(2)));
        setEditPrecioConImpuesto(Number(selectedProducto.price.toFixed(2)));
        setEditSelectedTax(impuesto.value);

        editForm.setFieldsValue({
          name: selectedProducto.name,
          sku: selectedProducto.sku,
          quantity: selectedProducto.quantity,
          price_base: Number(base.toFixed(2)),
          price: Number(selectedProducto.price.toFixed(2)),
          categoryId: selectedProducto.category?.id,
          taxId: impuesto.value,
        });
      }
    }
  }, [selectedProducto, taxOptions]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!busqueda.trim()) {
        setProductosFiltrados(productos);
      } else {
        const term = busqueda.toLowerCase();
        const filtrados = productos.filter(
          (prod) =>
            prod.name.toLowerCase().includes(term) ||
            prod.sku.toLowerCase().includes(term) ||
            prod.category?.name?.toLowerCase().includes(term)
        );
        setProductosFiltrados(filtrados);
      }
    }, 300); // ⏱ debounce 300ms

    return () => clearTimeout(delayDebounce);
  }, [busqueda, productos]);

  // Obtener productos y categorías al cargar la página
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchTaxes();
  }, []);

const fetchTaxes = async () => {
  try {
    const res = await fetch("/api/taxes");
    const { data } = await res.json();

    const formattedTaxes = data.map((tax) => ({
      value: tax.id, // Este es el que se usará para guardar y comparar
      label: `(${(tax.percent * 100).toFixed(2)}%)`, // Se mostrará esto
      percent: tax.percent,
      raw: tax, // opcional si quieres acceder a toda la info
    }));

    setTaxOptions(formattedTaxes);

    if (formattedTaxes.length > 0) {
      setSelectedTax(formattedTaxes[0].value);
      setEditSelectedTax(formattedTaxes[0].value);
    }
  } catch (err) {
    message.error("Error al cargar impuestos");
    console.error(err);
  }
};

  const getTaxPercent = (taxValue) => {
    const found = taxOptions.find((t) => t.value === taxValue);
    return found ? found.percent : 0;
  };


  // Trae los productos
  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventario");
      const data = await res.json();
      setProductos(data);
      setProductosFiltrados(data);
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
    const percent = getTaxPercent(selectedTax);
    const base = Number(values.price_base);
    const price = Number((base * (1 + percent)).toFixed(2));


    const dataToSend = {
      ...values,
      tax: selectedTax,
      categoryId: Number(values.categoryId),
      price: Number(price),
    };
    delete dataToSend.price_base;

    await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });
    
    message.success("Producto añadido");
    setModalVisible(false);
    form.resetFields();
    setPrecioBase(0);
    setPrecioConImpuesto(0);
    setSelectedTax(taxOptions[0]?.value || null);
    fetchProductos();
  } catch {
    message.error("No se pudo añadir el producto");
  }
};


  // Editar producto
const onEdit = async (values) => {
  try {
    const percent = getTaxPercent(editSelectedTax);
    const base = Number(values.price_base);
    const price = Number((base * (1 + percent)).toFixed(2));

    const dataToSend = {
      ...values,
      tax: editSelectedTax,
      categoryId: Number(values.categoryId),
      price: Number(price),
    };
    delete dataToSend.price_base;

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
    setEditPrecioBase(0);
    setEditPrecioConImpuesto(0);
    setEditSelectedTax(taxOptions[0]?.value || null);
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
    {
      title: 'Impuesto',
      dataIndex: 'tax',
      key: 'tax',
      render: (tax) => {
        if (!tax || !tax.clave) return 'Sin impuesto';
        const percent = typeof tax.percent === 'number' ? (tax.percent * 100).toFixed(2) : '';
        return `${percent ? `(${percent}%)` : ''}`;
      }
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (category) => category?.name || "Sin categoría",
    },
  ];

  // Selección de fila única
const rowSelection = {
  type: 'checkbox',
  selectedRowKeys,
  onChange: (newSelectedKeys, selectedRows) => {
    // Caso: se vuelve a seleccionar la misma fila (des-seleccionar)
    if (
      selectedRowKeys.length === 1 &&
      newSelectedKeys.length === 1 &&
      newSelectedKeys[0] === selectedRowKeys[0]
    ) {
      setSelectedRowKeys([]);
      setSelectedProducto(null);
      setEditPrecioBase(0);
      setEditPrecioConImpuesto(0);
      setEditSelectedTax(null);
      editForm.resetFields();
      return;
    }

    // Caso: nueva selección
    const selectedRow = selectedRows[0];
    const newKey = newSelectedKeys[0] ? [newSelectedKeys[0]] : [];
    setSelectedRowKeys(newKey);
    setSelectedProducto(selectedRow || null);

    if (selectedRow) {
      const tax = selectedRow?.tax?.clave;
      const percent = parseFloat(selectedRow?.tax?.descripcion) || 0;

      const baseRaw = percent > 0
        ? Number(selectedRow.price) / (1 + percent)
        : Number(selectedRow.price);
      const base = Number(baseRaw.toFixed(2));

      setEditPrecioBase(base);
      setEditPrecioConImpuesto(Number(selectedRow.price));
      setEditSelectedTax(tax);

      editForm.setFieldsValue({
        name: selectedRow.name,
        sku: selectedRow.sku,
        quantity: selectedRow.quantity,
        price_base: base,
        taxId: selectedRow.tax?.id,
        categoryId: selectedRow.category?.id,
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
          <Tooltip title="Exportar a Excel">
            <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
              Excel
            </Button>
          </Tooltip>
          <Tooltip title="Buscar productos">
            <Input
              placeholder="Buscar por nombre, SKU o categoría"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              allowClear
            />
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

  // ------ Handlers para el modal de crear producto ------
  // En el modal de crear:
  const handleBasePriceChange = (value) => {
    setPrecioBase(value || 0);
    const percent = getTaxPercent(selectedTax);
    setPrecioConImpuesto(((value || 0) * (1 + percent)));
    form.setFieldsValue({
      price: ((value || 0) * (1 + percent)).toFixed(2),
    });
  };

  const handleTaxChange = (value) => {
    setSelectedTax(value);
    const percent = getTaxPercent(value);
    setPrecioConImpuesto(precioBase * (1 + percent));
    form.setFieldsValue({
      price: (precioBase * (1 + percent)).toFixed(2),
    });
  };

  // En el modal de editar:
  const handleEditBasePriceChange = (value) => {
    setEditPrecioBase(value || 0);
    const percent = getTaxPercent(editSelectedTax);
    setEditPrecioConImpuesto(((value || 0) * (1 + percent)));
    editForm.setFieldsValue({
      price: ((value || 0) * (1 + percent)).toFixed(2),
    });
  };

  const handleEditTaxChange = (value) => {
    setEditSelectedTax(value);
    const percent = getTaxPercent(value);
    setEditPrecioConImpuesto(editPrecioBase * (1 + percent));
    editForm.setFieldsValue({
      price: (editPrecioBase * (1 + percent)).toFixed(2),
    });
  };

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
          dataSource={productosFiltrados}
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
        onCancel={() => {
          setModalVisible(false);
          setPrecioBase(0);
          setPrecioConImpuesto(0);
          form.resetFields();
        }}
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
            name="price_base"
            label="Precio sin impuesto"
            rules={[{ required: true, type: "number", min: 0 }]}
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              step={0.01}
              value={precioBase}
              onChange={handleBasePriceChange}
            />
          </Form.Item>
          <Form.Item
            name="taxId"
            label="Impuesto"
            rules={[{ required: true, message: "Seleccione el impuesto" }]}
          >
            <Select
              placeholder="Seleccione impuesto"
              onChange={handleTaxChange}
              value={selectedTax}
            >
              {taxOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Precio con impuesto">
            <InputNumber
              value={precioConImpuesto}
              readOnly
              style={{ width: "100%" }}
              formatter={(value) => Number(value).toFixed(2)}
            />
          </Form.Item>
          {/* Campo oculto para enviar el precio final */}
          <Form.Item name="price" hidden>
            <InputNumber />
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
        onCancel={() => {
          setModalEditVisible(false);
          setEditPrecioBase(0);
          setEditPrecioConImpuesto(0);
          editForm.resetFields();
        }}
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
            name="price_base"
            label="Precio sin impuesto"
            rules={[{ required: true, type: "number", min: 0 }]}
            initialValue={editPrecioBase}
          >
            <InputNumber
              style={{ width: "100%" }}
              step={0.01}
              value={editPrecioBase}
              onChange={handleEditBasePriceChange}
            />
          </Form.Item>
          <Form.Item
            name="taxId"
            label="Impuesto"
            rules={[{ required: true, message: "Seleccione el impuesto" }]}
          >
            <Select
              placeholder="Seleccione impuesto"
              onChange={handleEditTaxChange}
              value={editSelectedTax}
            >
              {taxOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Precio con impuesto">
            <InputNumber
              value={editPrecioConImpuesto}
              style={{ width: "100%" }}
              readOnly
              formatter={(value) => Number(value).toFixed(2)}
            />
          </Form.Item>
          {/* Campo oculto para enviar el precio final */}
          <Form.Item name="price" hidden>
            <InputNumber />
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