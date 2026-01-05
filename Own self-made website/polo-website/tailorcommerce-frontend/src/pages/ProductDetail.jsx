// src/pages/ProductDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  message,
  Image,
  Tag,
  Space,
  Divider,
  InputNumber,
  Select,
  Radio,
  Row,
  Col,
  Typography,
  Descriptions,
  Alert,
  Rate,
  Input,
  List,
  Avatar,
  Empty,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axiosInstance from "../api/axios";
import { useCart } from "../context/CartContext";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState("BUY");
  const [rentalDays, setRentalDays] = useState(5);
  const [fabricOption, setFabricOption] = useState("buy-only");
  const [meters, setMeters] = useState(null);
  const [selectedStitch, setSelectedStitch] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // Measurement states
  const [hasMeasurement, setHasMeasurement] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [checkingMeasurement, setCheckingMeasurement] = useState(false);
  const [stitchTypes, setStitchTypes] = useState([]);

  // Review states
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.category === "FABRIC") {
      checkMeasurementStatus();
      fetchStitchTypes();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}/`);
      if (response.data.success) {
        setProduct(response.data.product);
        if (response.data.product.variants?.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      }
    } catch (error) {
      message.error("Failed to load product");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchStitchTypes = async () => {
    try {
      // Fetch available stitch types from backend
      // For now, using hardcoded values
      setStitchTypes([
        { id: 1, name: "Shirt Stitching", price: 300, type: "shirt" },
        { id: 2, name: "Pant Stitching", price: 250, type: "pant" },
        { id: 3, name: "Kurta Stitching", price: 400, type: "kurta" },
      ]);
    } catch (error) {
      console.error("Failed to fetch stitch types");
    }
  };

  const checkMeasurementStatus = async () => {
    setCheckingMeasurement(true);
    try {
      const response = await axiosInstance.get("/bookings/my-measurements/");
      if (response.data.success && response.data.has_measurement) {
        setHasMeasurement(true);
        setMeasurements(response.data.measurements);
      }
    } catch (error) {
      console.error("Failed to check measurement status");
    } finally {
      setCheckingMeasurement(false);
    }
  };

  const getMetersForStitchType = (stitchTypeId) => {
    if (!measurements) return null;

    const stitchType = stitchTypes.find((st) => st.id === stitchTypeId);
    if (!stitchType) return null;

    switch (stitchType.type) {
      case "shirt":
        return measurements.shirt_meters;
      case "pant":
        return measurements.pant_meters;
      case "kurta":
        return measurements.kurta_meters;
      default:
        return null;
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant && product.category !== "FABRIC") {
      message.warning("Please select a variant");
      return;
    }

    if (product.category === "FABRIC") {
      if (fabricOption === "buy-only" && !meters) {
        message.warning("Please enter fabric meters");
        return;
      }
      if (fabricOption === "with-stitching") {
        if (!hasMeasurement) {
          message.warning("Please book a measurement appointment first");
          return;
        }
        if (!selectedStitch) {
          message.warning("Please select stitching type");
          return;
        }
      }
    }

    setAddingToCart(true);
    try {
      const payload = {
        product_id: product.id,
        purchase_type: purchaseType,
        quantity: quantity,
      };

      if (selectedVariant) {
        payload.variant_id = selectedVariant.id;
      }

      if (purchaseType === "RENT") {
        payload.rental_days = rentalDays;
      }

      if (product.category === "FABRIC") {
        if (fabricOption === "with-stitching") {
          payload.stitch_type_id = selectedStitch;
          // Get meters from measurements
          const metersForType = getMetersForStitchType(selectedStitch);
          if (metersForType) {
            payload.meters = metersForType;
          }
          console.log("Payload being sent:", payload);
          console.log("Meters:", metersForType);
        } else {
          payload.meters = meters;
        }
      }

      const response = await axiosInstance.post("/cart/add/", payload);

      if (response.data.success) {
        message.success("Added to cart!");
        await refreshCart();
      }
    } catch (error) {
      message.error(error.response?.data?.error || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const submitReview = async () => {
    if (userRating === 0) return message.error("Please select a star rating");
    setSubmittingReview(true);
    try {
      const res = await axiosInstance.post("/reviews/create/", {
        product_id: product.id,
        rating: userRating,
        comment: userComment,
      });
      if (res.data.success) {
        message.success("Review submitted successfully!");
        setUserRating(0);
        setUserComment("");
        // Optionally refresh product to show new review count/rating
        fetchProduct();
      }
    } catch (e) {
      message.error(e.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || checkingMeasurement) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 20px",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const stockAvailable = selectedVariant?.in_stock ?? true;
  const selectedStitchMeters = selectedStitch
    ? getMetersForStitchType(selectedStitch)
    : null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/products")}
        style={{ marginBottom: 16 }}
      >
        Back to Products
      </Button>

      <Row gutter={[24, 24]}>
        {/* Product Images */}
        <Col xs={24} md={12}>
          <Card>
            <Image.PreviewGroup>
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={product.name}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    height: 400,
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                  }}
                >
                  📦
                </div>
              )}

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {product.images?.slice(1).map((img) => (
                  <Image
                    key={img.id}
                    src={img.url}
                    width={80}
                    height={80}
                    style={{
                      objectFit: "cover",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </Card>
        </Col>

        {/* Product Details */}
        <Col xs={24} md={12}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Title & Tags */}
              <div>
                <Title level={2} style={{ marginBottom: 8 }}>
                  {product.name}
                </Title>
                <Space wrap>
                  <Tag color="blue">{product.category}</Tag>
                  {product.brand && <Tag>{product.brand}</Tag>}
                  {product.is_rentable && <Tag color="green">Rentable</Tag>}
                  {stockAvailable ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      In Stock
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                      Out of Stock
                    </Tag>
                  )}
                </Space>
              </div>

              <Divider />

              {/* Purchase Type (for rentable items) */}
              {product.is_rentable && product.is_buyable && (
                <>
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Purchase Type:
                    </Text>
                    <Radio.Group
                      value={purchaseType}
                      onChange={(e) => setPurchaseType(e.target.value)}
                    >
                      <Radio.Button value="BUY">Buy</Radio.Button>
                      <Radio.Button value="RENT">Rent</Radio.Button>
                    </Radio.Group>
                  </div>
                  <Divider />
                </>
              )}

              {/* Variants (Size/Color) */}
              {product.variants?.length > 0 && (
                <>
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Select Variant:
                    </Text>
                    <Select
                      style={{ width: "100%" }}
                      value={selectedVariant?.id}
                      onChange={(value) => {
                        const variant = product.variants.find(
                          (v) => v.id === value
                        );
                        setSelectedVariant(variant);
                      }}
                      size="large"
                    >
                      {product.variants.map((variant) => (
                        <Option
                          key={variant.id}
                          value={variant.id}
                          disabled={!variant.in_stock}
                        >
                          {variant.size && `${variant.size} - `}
                          {variant.color}
                          {!variant.in_stock && " (Out of Stock)"}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <Divider />
                </>
              )}

              {/* Fabric Options */}
              {product.category === "FABRIC" && (
                <>
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Fabric Options:
                    </Text>

                    {/* Measurement Status Alert */}
                    {!hasMeasurement && (
                      <Alert
                        message="Measurement Required for Stitching"
                        description={
                          <Space direction="vertical" size="small">
                            <Text>
                              To order fabric with stitching, please book a
                              measurement appointment first.
                            </Text>
                            <Button
                              type="primary"
                              size="small"
                              icon={<CalendarOutlined />}
                              onClick={() => navigate("/bookings")}
                            >
                              Book Measurement
                            </Button>
                          </Space>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    {hasMeasurement && (
                      <Alert
                        message="✓ Measurement Completed"
                        description="Your measurements are on file. You can now order fabric with stitching!"
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    <Radio.Group
                      value={fabricOption}
                      onChange={(e) => {
                        setFabricOption(e.target.value);
                        if (e.target.value === "buy-only") {
                          setSelectedStitch(null);
                        } else {
                          setMeters(null);
                        }
                      }}
                      style={{ width: "100%" }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Radio
                          value="buy-only"
                          style={{
                            display: "block",
                            padding: "12px",
                            background: "#f5f5f5",
                            borderRadius: 8,
                          }}
                        >
                          <Text strong>Buy Fabric Only</Text>
                          <Text
                            type="secondary"
                            style={{ display: "block", fontSize: 12 }}
                          >
                            Select your own meters
                          </Text>
                        </Radio>

                        <Radio
                          value="with-stitching"
                          disabled={!hasMeasurement}
                          style={{
                            display: "block",
                            padding: "12px",
                            background: hasMeasurement ? "#f0f9ff" : "#f5f5f5",
                            borderRadius: 8,
                          }}
                        >
                          <Text strong>Buy Fabric + Stitching</Text>
                          <Text
                            type="secondary"
                            style={{ display: "block", fontSize: 12 }}
                          >
                            {hasMeasurement
                              ? "Uses your measured specifications"
                              : "⚠️ Requires measurement appointment"}
                          </Text>
                        </Radio>
                      </Space>
                    </Radio.Group>

                    {/* Meters Input - Only for "Buy Only" */}
                    {fabricOption === "buy-only" && (
                      <div style={{ marginTop: 16 }}>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: 8 }}
                        >
                          Enter Meters: <Text type="danger">*</Text>
                        </Text>
                        <InputNumber
                          min={0.5}
                          max={10}
                          step={0.5}
                          placeholder="Enter meters (e.g., 3.0)"
                          style={{ width: "100%" }}
                          value={meters}
                          onChange={setMeters}
                          size="large"
                          addonAfter="meters"
                        />
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          Price per meter: ₹
                          {product.fabric_details.price_per_meter}
                        </Text>
                      </div>
                    )}

                    {/* Stitching Type - Only for "With Stitching" */}
                    {fabricOption === "with-stitching" && hasMeasurement && (
                      <div style={{ marginTop: 16 }}>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: 8 }}
                        >
                          Select Stitching Type: <Text type="danger">*</Text>
                        </Text>
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Choose stitching type"
                          value={selectedStitch}
                          onChange={setSelectedStitch}
                          size="large"
                        >
                          {stitchTypes.map((st) => (
                            <Option key={st.id} value={st.id}>
                              {st.name} - ₹{st.price}
                            </Option>
                          ))}
                        </Select>

                        {selectedStitchMeters && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: 12,
                              background: "#f0f9ff",
                              borderRadius: 8,
                              border: "1px solid #91d5ff",
                            }}
                          >
                            <Space
                              direction="vertical"
                              size={4}
                              style={{ width: "100%" }}
                            >
                              <Text strong style={{ fontSize: 13 }}>
                                📏 Your Measurements:
                              </Text>
                              <Text style={{ fontSize: 12 }}>
                                Fabric required:{" "}
                                <Text strong>{selectedStitchMeters}m</Text>
                              </Text>
                              <Divider style={{ margin: "8px 0" }} />
                              <Space direction="vertical" size={0}>
                                <Text style={{ fontSize: 12 }}>
                                  Fabric: {selectedStitchMeters}m × ₹
                                  {product.fabric_details.price_per_meter} =
                                  <Text strong>
                                    {" "}
                                    ₹
                                    {(
                                      selectedStitchMeters *
                                      product.fabric_details.price_per_meter
                                    ).toLocaleString("en-IN")}
                                  </Text>
                                </Text>
                                <Text style={{ fontSize: 12 }}>
                                  Stitching:{" "}
                                  <Text strong>
                                    ₹
                                    {
                                      stitchTypes.find(
                                        (st) => st.id === selectedStitch
                                      )?.price
                                    }
                                  </Text>
                                </Text>
                                <Text
                                  strong
                                  style={{
                                    fontSize: 14,
                                    color: "#1890ff",
                                    marginTop: 4,
                                  }}
                                >
                                  Total: ₹
                                  {(
                                    selectedStitchMeters *
                                      product.fabric_details.price_per_meter +
                                    (stitchTypes.find(
                                      (st) => st.id === selectedStitch
                                    )?.price || 0)
                                  ).toLocaleString("en-IN")}
                                </Text>
                              </Space>
                            </Space>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Divider />
                </>
              )}

              {/* Rental Days */}
              {purchaseType === "RENT" && (
                <>
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Rental Days:
                    </Text>
                    <InputNumber
                      min={1}
                      value={rentalDays}
                      onChange={setRentalDays}
                      style={{ width: "100%" }}
                      size="large"
                    />
                  </div>
                  <Divider />
                </>
              )}

              {/* Quantity */}
              {product.category !== "FABRIC" && (
                <>
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Quantity:
                    </Text>
                    <InputNumber
                      min={1}
                      max={selectedVariant?.stock_quantity || 99}
                      value={quantity}
                      onChange={setQuantity}
                      style={{ width: "100%" }}
                      size="large"
                    />
                  </div>
                  <Divider />
                </>
              )}

              {/* Price */}
              <div
                style={{
                  background: "#f5f5f5",
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">Price:</Text>
                <Title level={3} style={{ margin: "8px 0", color: "#1890ff" }}>
                  {purchaseType === "RENT" && product.rental_config
                    ? `₹${product.rental_config.deposit_amount.toLocaleString(
                        "en-IN"
                      )} (Deposit)`
                    : product.category === "FABRIC"
                    ? fabricOption === "buy-only" && meters
                      ? `₹${(
                          product.fabric_details.price_per_meter * meters
                        ).toLocaleString("en-IN")}`
                      : fabricOption === "with-stitching" &&
                        selectedStitch &&
                        selectedStitchMeters
                      ? `₹${(
                          selectedStitchMeters *
                            product.fabric_details.price_per_meter +
                          (stitchTypes.find((st) => st.id === selectedStitch)
                            ?.price || 0)
                        ).toLocaleString("en-IN")}`
                      : "Select options"
                    : selectedVariant?.price
                    ? `₹${selectedVariant.price.toLocaleString("en-IN")}`
                    : "Price on request"}
                </Title>
                {purchaseType === "RENT" && product.rental_config && (
                  <Text type="secondary">
                    ₹{product.rental_config.rent_per_day}/day × {rentalDays}{" "}
                    days
                  </Text>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={
                  !stockAvailable ||
                  (product.category === "FABRIC" &&
                    fabricOption === "with-stitching" &&
                    !hasMeasurement)
                }
                block
              >
                {!stockAvailable
                  ? "Out of Stock"
                  : product.category === "FABRIC" &&
                    fabricOption === "with-stitching" &&
                    !hasMeasurement
                  ? "Book Measurement First"
                  : "Add to Cart"}
              </Button>

              <Divider />

              {/* Description */}
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Description:
                </Text>
                <Paragraph>{product.description}</Paragraph>
              </div>

              {/* Product Info */}
              {product.fabric_details && (
                <>
                  <Divider />
                  <Descriptions title="Fabric Details" column={1} size="small">
                    <Descriptions.Item label="Material">
                      {product.fabric_details.material}
                    </Descriptions.Item>
                    <Descriptions.Item label="Color">
                      {product.fabric_details.color}
                    </Descriptions.Item>
                    <Descriptions.Item label="Price per meter">
                      ₹{product.fabric_details.price_per_meter}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* ✅ NEW: Customer Reviews Section */}
      <div style={{ marginTop: 32 }}>
        <Card title={`Customer Reviews (${product.review_count || 0})`}>
          {product.reviews && product.reviews.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={product.reviews}
              renderItem={(review) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{review.user}</Text>
                        <Rate
                          disabled
                          defaultValue={review.rating}
                          style={{ fontSize: 12 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <Paragraph>{review.comment}</Paragraph>
                        {/* ✅ NEW: Display Review Image */}
                        {review.image && (
                          <Image
                            src={review.image}
                            width={100}
                            style={{ borderRadius: 8, marginTop: 8 }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="No reviews yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;
