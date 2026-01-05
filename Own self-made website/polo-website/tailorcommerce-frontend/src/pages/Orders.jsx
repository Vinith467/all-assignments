// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import {
  Card,
  Empty,
  List,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Timeline,
  Modal,
  Descriptions,
  Row,
  Col,
  Spin,
  Upload,
  Rate,
  Input,
  Form,
  message,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { UploadOutlined, StarOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // ✅ NEW: Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/orders/");
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to load order details");
    } finally {
      setLoadingDetail(false);
    }
  };
  const handleReviewSubmit = async (values) => {
    setSubmittingReview(true);
    const formData = new FormData();
    formData.append("product_id", reviewProduct.product_id);
    formData.append("rating", values.rating);
    formData.append("comment", values.comment);

    if (values.image && values.image.fileList.length > 0) {
      formData.append("image", values.image.fileList[0].originFileObj);
    }

    try {
      const res = await axiosInstance.post("/reviews/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        message.success("Review submitted successfully!");
        setReviewModalOpen(false);
        reviewForm.resetFields();
      }
    } catch (e) {
      message.error(e.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      PLACED: "blue",
      PROCESSING: "orange",
      STITCHING: "purple",
      READY: "green",
      PICKED_UP: "cyan",
      COMPLETED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    if (status === "COMPLETED" || status === "PICKED_UP") {
      return <CheckCircleOutlined />;
    }
    return <ClockCircleOutlined />;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <Empty description="No orders yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button
            type="primary"
            icon={<ShoppingOutlined />}
            onClick={() => navigate("/products")}
            size="large"
          >
            Start Shopping
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>My Orders</Title>

      <List
        dataSource={orders}
        renderItem={(order) => (
          <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: 0 }}>
            <div style={{ padding: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                {/* Order Info */}
                <Col xs={24} md={14}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Space wrap>
                      <Text strong style={{ fontSize: 16 }}>
                        Order #{order.order_number}
                      </Text>
                      <Tag
                        color={getStatusColor(order.status)}
                        icon={getStatusIcon(order.status)}
                      >
                        {order.status}
                      </Tag>
                    </Space>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>

                    <Space wrap>
                      <Text>
                        <strong>{order.items_count}</strong> item(s)
                      </Text>
                      <Divider type="vertical" />
                      <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                        ₹{order.total_amount.toLocaleString("en-IN")}
                      </Text>
                    </Space>
                  </Space>
                </Col>

                {/* Actions */}
                <Col xs={24} md={10} style={{ textAlign: "right" }}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => fetchOrderDetail(order.order_id)}
                    loading={loadingDetail}
                  >
                    View Details
                  </Button>
                </Col>
              </Row>
            </div>
          </Card>
        )}
      />

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.order_number}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Order Summary */}
            <Card title="Order Summary" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Order Number">
                  <Text strong>{selectedOrder.order_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Order Date">
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                    ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Delivery Address */}
            {selectedOrder.address && (
              <Card title="Pickup Information" size="small">
                <Text>
                  <strong>{selectedOrder.address.name}</strong>
                  <br />
                  {selectedOrder.address.phone}
                  <br />
                  {selectedOrder.address.address_line}
                  <br />
                  {selectedOrder.address.city}, {selectedOrder.address.state} -{" "}
                  {selectedOrder.address.pincode}
                </Text>
              </Card>
            )}

            {/* Order Items */}
            <Card title="Order Items" size="small">
              <List
                dataSource={selectedOrder.items}
                renderItem={(item, index) => (
                  <>
                    <div style={{ padding: "12px 0" }}>
                      {/* ✅ FLEX CONTAINER FOR IMAGE + DETAILS */}
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* ✅ IMAGE COLUMN */}
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            background: "#f5f5f5",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            border: "1px solid #f0f0f0",
                            flexShrink: 0,
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.product_name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 20 }}>📦</span>
                          )}
                        </div>

                        {/* ✅ DETAILS COLUMN (Existing Logic) */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Space
                            orientation="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <Row justify="space-between">
                              <Col>
                                <Text strong>{item.product_name}</Text>
                              </Col>
                              <Col>
                                <Text strong>
                                  ₹{item.price.toLocaleString("en-IN")}
                                </Text>
                              </Col>
                            </Row>

                            <Space wrap size="small">
                              <Tag>{item.product_category}</Tag>
                              {item.purchase_type === "RENT" && (
                                <Tag color="green">RENTAL</Tag>
                              )}
                              {item.stitching_status !== "NOT_APPLICABLE" && (
                                <Tag color="blue">{item.stitching_status}</Tag>
                              )}
                            </Space>

                            {item.variant_snapshot && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.variant_snapshot.size &&
                                  `Size: ${item.variant_snapshot.size}, `}
                                Color: {item.variant_snapshot.color}
                              </Text>
                            )}

                            {item.fabric_snapshot && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Fabric: {item.fabric_snapshot.material} -{" "}
                                {item.fabric_snapshot.color}
                              </Text>
                            )}

                            {item.stitch_type_snapshot && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Stitching: {item.stitch_type_snapshot.name} - ₹
                                {item.stitch_type_snapshot.price}
                              </Text>
                            )}

                            {item.rental_info && (
                              <div
                                style={{
                                  background: "#f0f9ff",
                                  padding: 8,
                                  borderRadius: 4,
                                }}
                              >
                                <Text style={{ fontSize: 12 }}>
                                  <strong>Rental Details:</strong>
                                  <br />
                                  Deposit: ₹
                                  {item.rental_info.deposit_amount.toLocaleString(
                                    "en-IN"
                                  )}
                                  <br />
                                  Rent: ₹{item.rental_info.rent_per_day}/day
                                  <br />
                                  Expected Return:{" "}
                                  {new Date(
                                    item.rental_info.expected_return_date
                                  ).toLocaleDateString("en-IN")}
                                  <br />
                                  Status:{" "}
                                  <Tag size="small">
                                    {item.rental_info.status}
                                  </Tag>
                                  {item.rental_info.refund_amount > 0 && (
                                    <>
                                      <br />
                                      Refund: ₹
                                      {item.rental_info.refund_amount.toLocaleString(
                                        "en-IN"
                                      )}
                                    </>
                                  )}
                                </Text>
                              </div>
                            )}

                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Quantity: {item.quantity}
                            </Text>
                            {/* ✅ NEW: Review Button (Only if Order is Completed/PickedUp/Ready) */}
                            {["COMPLETED", "PICKED_UP", "READY"].includes(
                              selectedOrder.status
                            ) &&
                              item.product_id && (
                                <Button
                                  size="small"
                                  icon={<StarOutlined />}
                                  onClick={() => {
                                    setReviewProduct(item);
                                    setReviewModalOpen(true);
                                  }}
                                >
                                  Write Review
                                </Button>
                              )}
                          </Space>
                        </div>
                      </div>
                    </div>
                    {index < selectedOrder.items.length - 1 && (
                      <Divider style={{ margin: 0 }} />
                    )}
                  </>
                )}
              />
            </Card>

            {/* Status History */}
            {selectedOrder.status_history &&
              selectedOrder.status_history.length > 0 && (
                <Card title="Order Timeline" size="small">
                  <Timeline>
                    {selectedOrder.status_history.map((history, index) => (
                      <Timeline.Item
                        key={index}
                        color={getStatusColor(history.status)}
                        dot={getStatusIcon(history.status)}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>{history.status}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(history.changed_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Text>
                          {history.note && (
                            <Text style={{ fontSize: 12 }}>{history.note}</Text>
                          )}
                          {history.changed_by && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              by {history.changed_by}
                            </Text>
                          )}
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              )}

            {/* Payment & Invoice Info */}
            <Row gutter={16}>
              {selectedOrder.payment && (
                <Col xs={24} md={12}>
                  <Card title="Payment" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Method">
                        {selectedOrder.payment.provider}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag
                          color={
                            selectedOrder.payment.status === "SUCCESS"
                              ? "success"
                              : "warning"
                          }
                        >
                          {selectedOrder.payment.status}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Amount">
                        ₹{selectedOrder.payment.amount.toLocaleString("en-IN")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              )}

              {selectedOrder.invoice && (
                <Col xs={24} md={12}>
                  <Card title="Invoice" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Invoice No">
                        {selectedOrder.invoice.invoice_number}
                      </Descriptions.Item>
                      <Descriptions.Item label="GST">
                        ₹
                        {selectedOrder.invoice.gst_amount.toLocaleString(
                          "en-IN"
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Total">
                        ₹
                        {selectedOrder.invoice.total_with_gst.toLocaleString(
                          "en-IN"
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              )}
            </Row>

            {/* Action Buttons */}
            {selectedOrder.items.some(
              (item) => item.stitching_status === "PENDING_MEASUREMENT"
            ) && (
              <div
                style={{ background: "#fffbe6", padding: 16, borderRadius: 8 }}
              >
                <Space direction="vertical">
                  <Text strong>📏 Measurement Required</Text>
                  <Paragraph style={{ marginBottom: 8 }}>
                    This order contains items that require measurements. Please
                    book an appointment with our tailor.
                  </Paragraph>
                  <Button
                    type="primary"
                    onClick={() => {
                      setDetailModalOpen(false);
                      navigate("/bookings");
                    }}
                  >
                    Book Measurement Appointment
                  </Button>
                </Space>
              </div>
            )}

            {/* ✅ NEW: Review Modal */}
            <Modal
              title={`Review ${reviewProduct?.product_name}`}
              open={reviewModalOpen}
              onCancel={() => setReviewModalOpen(false)}
              footer={null}
            >
              <Form
                layout="vertical"
                form={reviewForm}
                onFinish={handleReviewSubmit}
              >
                <Form.Item
                  name="rating"
                  label="Rating"
                  rules={[{ required: true }]}
                >
                  <Rate />
                </Form.Item>
                <Form.Item name="comment" label="Review">
                  <Input.TextArea rows={4} placeholder="How was the product?" />
                </Form.Item>
                <Form.Item name="image" label="Upload Photo (Optional)">
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submittingReview}
                  block
                >
                  Submit Review
                </Button>
              </Form>
            </Modal>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
