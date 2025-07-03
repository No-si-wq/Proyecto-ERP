import React from "react";
import { Card, Row, Col, Divider, Typography } from "antd";

const { Title, Text } = Typography;

export default function ConfirmarVentaCard({ subtotal, impuesto = 0.15, onCancel, onConfirm }) {
  const impuestos = +(subtotal * impuesto).toFixed(2);
  const total = +(subtotal + impuestos).toFixed(2);

  return (
    <Card
      style={{
        maxWidth: 400,
        margin: "0 auto",
        borderRadius: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        fontSize: 16
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
        Confirmar Venta
      </Title>
      <Row style={{ marginBottom: 8 }}>
        <Col span={12}><Text>Subtotal</Text></Col>
        <Col span={12} style={{ textAlign: "right" }}><Text>${subtotal.toFixed(2)}</Text></Col>
      </Row>
      <Row style={{ marginBottom: 8 }}>
        <Col span={12}><Text>Descuento</Text></Col>
        <Col span={12} style={{ textAlign: "right" }}><Text>$0.00</Text></Col>
      </Row>
      <Row style={{ marginBottom: 8 }}>
        <Col span={12}><Text>Impuestos (15%)</Text></Col>
        <Col span={12} style={{ textAlign: "right" }}><Text>${impuestos.toFixed(2)}</Text></Col>
      </Row>
      <Divider style={{ margin: "12px 0" }} />
      <Row style={{ marginBottom: 8 }}>
        <Col span={12}><Text strong>Total</Text></Col>
        <Col span={12} style={{ textAlign: "right" }}><Text strong>${total.toFixed(2)}</Text></Col>
      </Row>
      <Divider style={{ margin: "12px 0" }} />
      {/* Botones de acción */}
      <Row justify="end" gutter={12}>
        <Col>
          <button
            type="button"
            style={{
              padding: "6px 20px",
              background: "#ff7875",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              marginRight: 8,
              cursor: "pointer"
            }}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </Col>
        <Col>
          <button
            type="button"
            style={{
              padding: "6px 20px",
              background: "#52c41a",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </Col>
      </Row>
    </Card>
  );
}