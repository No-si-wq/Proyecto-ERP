import { Tree, Button, Typography } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const SidebarMenu = ({ treeData, onSelect, onCreate, selectedKey }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <Button icon={<HomeOutlined />} onClick={() => navigate("/home")} size="small">
          Inicio
        </Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
        <Button icon={<PlusOutlined />} size="small" type="primary" onClick={onCreate} />
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => {
            if (!selectedKey || selectedKey.includes("-")) {
              alert("Seleccione una tienda para editar.");
              return;
            }
            alert(`Editar ${selectedKey}`);
          }}
        />
        <Button
          icon={<DeleteOutlined />}
          size="small"
          danger
          onClick={() => {
            if (!selectedKey || selectedKey.includes("-")) {
              alert("Seleccione una tienda para eliminar.");
              return;
            }
            alert(`Eliminar ${selectedKey}`);
          }}
        />
      </div>
      <Title level={4}>Tiendas</Title>
      <Tree
        showIcon
        defaultExpandAll
        onSelect={onSelect}
        treeData={treeData}
        style={{ padding: "0 16px" }}
      />
    </div>
  );
};

export default SidebarMenu;