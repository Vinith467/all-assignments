// src/pages/Checkout.jsx
import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Steps,
  Form,
  Input,
  Radio,
  message,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Result,
} from "antd";
import { useCart } from "../context/CartContext";
import {
  CheckCircleOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const { Title, Text, Paragraph} = Typography;
const { Step } = Steps;

const Checkout = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCart();
  }, []);
  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get("/cart/");
      if (response.data.success) {
        if (response.data.cart.items_count === 0) {
          message.warning("Your cart is empty");
          navigate("/cart");
          return;
        }
        setCart(response.data.cart);
      }
    } catch (error) {
      message.error("Failed to load cart");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };
  const { refreshCart } = useCart();
  const handlePlaceOrder = async (values) => {
    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/orders/create/", {
        payment_method: values.payment_method,
      });

      if (response.data.success) {
        setOrderCreated(response.data.order);
        setCurrent(2);
        message.success("Order placed successfully!");
        await refreshCart();
      }
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Cart Review",
      icon: <ShoppingCartOutlined />,
    },
    {
      title: "Payment",
      icon: <CreditCardOutlined />,
    },
    {
      title: "Confirmation",
      icon: <CheckCircleOutlined />,
    },
  ];

  if (loading) {
    return <Card loading={true} />;
  }

  // Step 3: Order Confirmation
  if (orderCreated) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Result
          status="success"
          title="Order Placed Successfully!"
          subTitle={`Order Number: ${orderCreated.order_number}`}
          extra={[
            <Button
              type="primary"
              key="orders"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </Button>,
            <Button key="home" onClick={() => navigate("/")}>
              Back to Home
            </Button>,
          ]}
        >
          <Card>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Order ID:</Text>
                <Title level={4} style={{ margin: "4px 0" }}>
                  {orderCreated.order_number}
                </Title>
              </div>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Total Amount:</Text>
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      ₹{orderCreated.total_amount.toLocaleString("en-IN")}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Items:</Text>
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {orderCreated.items_count}
                    </Text>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div
                style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}
              >
                <Title level={5}>What's Next?</Title>
                <Paragraph>
                  📦 Your order has been placed successfully
                  <br />
                  ✂️ For stitching items, book a measurement appointment
                  <br />
                  🏪 You will be notified when ready for pickup
                  <br />
                  📱 Track your order in "My Orders" section
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Result>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2}>Checkout</Title>

      <Steps current={current} style={{ marginBottom: 32 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          {current === 0 && (
            <Card title="Review Your Cart">
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {cart.items.map((item, index) => (
                  <div key={item.id}>
                    <Row gutter={16} align="middle">
                      {/* ADD IMAGE COLUMN */}
                      <Col xs={6} sm={4}>
                        <div
                          style={{
                            width: "100%",
                            height: 60,
                            background: "#f5f5f5",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: 24 }}>📦</div>
                          )}
                        </div>
                      </Col>

                      {/* UPDATE PRODUCT INFO COLUMN */}
                      <Col xs={12} sm={14}>
                        <Space direction="vertical" size="small">
                          <Text strong>{item.product.name}</Text>
                          <Space wrap size="small">
                            <Tag>{item.product.category}</Tag>
                            {item.purchase_type === "RENT" && (
                              <Tag color="green">Rental</Tag>
                            )}
                          </Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Qty: {item.quantity} × ₹{item.price_snapshot}
                          </Text>
                        </Space>
                      </Col>

                      {/* PRICE COLUMN */}
                      <Col xs={6} sm={6} style={{ textAlign: "right" }}>
                        <Text strong style={{ fontSize: 16 }}>
                          ₹{item.subtotal.toLocaleString("en-IN")}
                        </Text>
                      </Col>
                    </Row>
                    {index < cart.items.length - 1 && <Divider />}
                  </div>
                ))}
                <Divider />
                <Row justify="space-between">
                  <Text strong style={{ fontSize: 18 }}>
                    Total:
                  </Text>
                  <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                    ₹{cart.total.toLocaleString("en-IN")}
                  </Text>
                </Row>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setCurrent(1)}
                  block
                >
                  Continue to Payment
                </Button>
              </Space>
            </Card>
          )}

          {current === 1 && (
            <Card title="Payment Method">
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePlaceOrder}
                initialValues={{ payment_method: "MANUAL" }}
              >
                <Form.Item
                  name="payment_method"
                  label="Select Payment Method"
                  rules={[
                    { required: true, message: "Please select payment method" },
                  ]}
                >
                  <Radio.Group size="large">
                    <Space direction="vertical" size="middle">
                      <Radio value="MANUAL">
                        <Space>
                          <HomeOutlined />
                          <div>
                            <div>
                              <Text strong>Cash on Pickup</Text>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Pay when you pick up from store
                            </Text>
                          </div>
                        </Space>
                      </Radio>

                      <Radio value="RAZORPAY" disabled>
                        <Space>
                          <CreditCardOutlined />
                          <div>
                            <div>
                              <Text strong>Online Payment</Text>
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Coming soon
                            </Text>
                          </div>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <Divider />

                <div
                  style={{
                    background: "#fffbe6",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 24,
                  }}
                >
                  <Text>
                    💡 <strong>Note:</strong> For items requiring stitching,
                    you'll need to book a measurement appointment after placing
                    the order.
                  </Text>
                </div>

                <Space size="middle">
                  <Button onClick={() => setCurrent(0)}>Back</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                  >
                    Place Order
                  </Button>
                </Space>
              </Form>
            </Card>
          )}
        </Col>

        {/* Order Summary Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Order Summary" style={{ position: "sticky", top: 80 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Row justify="space-between">
                  <Text>Items ({cart.items_count}):</Text>
                  <Text>₹{cart.total.toLocaleString("en-IN")}</Text>
                </Row>
              </div>

              <Divider style={{ margin: 0 }} />

              <div>
                <Row justify="space-between">
                  <Text>Delivery:</Text>
                  <Text type="success">FREE Pickup</Text>
                </Row>
              </div>

              <Divider style={{ margin: 0 }} />

              <div>
                <Row justify="space-between">
                  <Text strong style={{ fontSize: 16 }}>
                    Total:
                  </Text>
                  <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                    ₹{cart.total.toLocaleString("en-IN")}
                  </Text>
                </Row>
              </div>

              <Divider style={{ margin: 0 }} />

              <div
                style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}
              >
                <Space direction="vertical" size="small">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ✓ Secure checkout
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ✓ Free store pickup
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ✓ Expert tailoring available
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
