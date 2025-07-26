import React, { useState, useEffect } from "react";
import { Table, Tabs, Space, Button, Input, message, Modal } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  SearchOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import { useInventario } from "../hooks/useInventario";
import ProductoForm from "./ProductoForm";

const { TabPane } = Tabs;

const InventarioView = ({ storeId }) => {
  const {
    productos,
    categorias,
    taxOptions,
    loading,
    fetchProductos
  } = useInventario(storeId);

  const [busqueda, setBusqueda] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState(productos);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  useEffect(() => {
    const term = busqueda.toLowerCase().trim();
    setProductosFiltrados(
      term
        ? productos.filter(p =>
            [p.name, p.sku, p.category?.name]
              .filter(Boolean)
              .some(s => s.toLowerCase().includes(term))
          )
        : productos
    );
  }, [busqueda, productos]);

  const exportToExcel = () => {
    const data = productos.map(p => ({
      Nombre: p.name,
      SKU: p.sku,
      Cantidad: p.quantity,
      Precio: p.price.toFixed(2),
      Impuesto: p.tax ? `${(p.tax.percent * 100).toFixed(2)}%` : "0%",
      Categoría: p.category?.name || "Sin categoría"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Inventario.xlsx");
  };

  const handleDelete = async () => {
    if (!selectedProducto) return;
    Modal.confirm({
      title: "Eliminar producto",
      content: `¿Desea eliminar "${selectedProducto.name}"?`,
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const res = await fetch(
            `/api/products/${selectedProducto.id}`,
            { method: "DELETE" }
          );
          if (!res.ok) throw new Error();
          message.success("Producto eliminado");
          setSelectedProducto(null);
          fetchProductos();
        } catch {
          message.error("Error al eliminar producto");
        }
      }
    });
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    {
      title: "Precio",
      dataIndex: "price",
      key: "price",
      render: v => `L. ${v.toFixed(2)}`
    },
    {
      title: "Impuesto",
      dataIndex: "tax",
      key: "tax",
      render: t =>
        t?.percent != null ? `(${(t.percent * 100).toFixed(2)}%)` : "Sin impuesto"
    },
    {
      title: "Categoría",
      dataIndex: ["category", "name"],
      key: "category"
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1" type="card" style={{ marginBottom: 16 }}>
        <TabPane
          tab={
            <span>
              <AppstoreOutlined /> Archivo
            </span>
          }
          key="1"
        >
          <Space wrap>
            <Button onClick={() => setModalVisible(true)} icon={<PlusOutlined />}>
              Añadir
            </Button>
            <Button
              onClick={() => setModalEditVisible(true)}
              icon={<EditOutlined />}
              disabled={!selectedProducto}
            >
              Editar
            </Button>
            <Button
              onClick={handleDelete}
              icon={<DeleteOutlined />}
              disabled={!selectedProducto}
            >
              Eliminar
            </Button>
            <Button onClick={fetchProductos} icon={<ReloadOutlined />}>
              Actualizar
            </Button>
            <Button onClick={exportToExcel} icon={<FileExcelOutlined />}>
              Excel
            </Button>
            <Input
              placeholder="Buscar..."
              prefix={<SearchOutlined />}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </Space>
        </TabPane>
      </Tabs>

      <Table
        columns={columns}
        dataSource={productosFiltrados}
        loading={loading}
        rowKey="id"
        rowSelection={{
          type: "radio",
          selectedRowKeys: selectedProducto ? [selectedProducto.id] : [],
          onChange: (_, rows) => {
            setSelectedProducto(rows[0] || null);
          }
        }}
        pagination={{ pageSize: 12 }}
      />

      <ProductoForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchProductos();
        }}
        categorias={categorias}
        taxOptions={taxOptions}
        storeId={storeId}
      />

      {selectedProducto && (
        <ProductoForm
          visible={modalEditVisible}
          initialData={selectedProducto}
          isEdit
          onCancel={() => setModalEditVisible(false)}
          onSuccess={() => {
            setModalEditVisible(false);
            setSelectedProducto(null);
            fetchProductos();
          }}
          categorias={categorias}
          taxOptions={taxOptions}
          storeId={storeId}
        />
      )}
    </div>
  );
};

export default InventarioView;