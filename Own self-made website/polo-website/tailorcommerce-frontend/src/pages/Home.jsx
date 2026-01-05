// src/pages/Home.jsx
import { Card, Row, Col, Button, Typography } from "antd";
import {
  ShoppingOutlined,
  ScissorOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShoppingOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      title: "Shop Products",
      description:
        "Browse our collection of fabrics, ready-made clothing, and accessories",
      action: () => navigate("/products"),
    },
    {
      icon: <ScissorOutlined style={{ fontSize: 48, color: "#52c41a" }} />,
      title: "Custom Tailoring",
      description:
        "Get perfectly fitted clothes with our expert tailoring services",
      action: () => navigate("/bookings"),
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 48, color: "#fa8c16" }} />,
      title: "Book Appointment",
      description:
        "Schedule a measurement session with our professional tailors",
      action: () => navigate("/bookings"),
    },
  ];

  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          textAlign: "center",
          background: "linear-gradient(135deg, #001529, #4096ff)",
          color: "white",
        }}
      >
        <Title level={1} style={{ color: "white", marginBottom: 16 }}>
          Welcome to Polo Fashions
        </Title>
        <Paragraph style={{ fontSize: 18, color: "white" }}>
          Your one-stop destination for premium fabrics, custom tailoring, and
          ready-made clothing
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/products")}
          style={{
            backgroundColor: "#ecb708ff",
            borderColor: "#ecb708ff",
            color: "#000",
            fontWeight: 600,
          }}
        >
          Shop Now
        </Button>
      </Card>

      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} md={8} key={index}>
            <Card hoverable style={{ textAlign: "center", height: "100%" }}>
              <div style={{ marginBottom: 16 }}>{feature.icon}</div>
              <Title level={3}>{feature.title}</Title>
              <Paragraph>{feature.description}</Paragraph>
              <Button type="primary" onClick={feature.action}>
                Learn More
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
