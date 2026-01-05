// src/pages/Products.jsx
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Spin,
  message,
  Tag,
  Button,
  Select,
  Input,
  Slider,
  Drawer,
  Space,
  Typography,
  Badge,
  Rate,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useWishlist } from "../context/WishlistContext";

const { Meta } = Card;
const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter States
  const [category, setCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isRentable, setIsRentable] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, [category, searchText, isRentable]);

  const fetchWishlist = async () => {
    try {
      const res = await axiosInstance.get("/wishlist/");
      if (res.data.success) {
        const ids = new Set(res.data.wishlist.map((item) => item.product_id));
        setWishlistIds(ids);
      }
    } catch (e) {
      // Silent fail if not logged in or empty
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (searchText) params.search = searchText;
      if (isRentable) params.is_rentable = "true";

      const response = await axiosInstance.get("/products/list/", { params });
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };



  const clearFilters = () => {
    setCategory(null);
    setSearchText("");
    setIsRentable(false);
    setPriceRange([0, 10000]);
    setFilterVisible(false);
  };

  const activeFiltersCount =
    (category ? 1 : 0) + (isRentable ? 1 : 0) + (searchText ? 1 : 0);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px" }}>
      {/* Top Bar */}
      <div
        style={{
          marginBottom: 24,
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Collection
        </Title>

        <Space size="middle" style={{ flex: 1, justifyContent: "flex-end" }}>
          <Search
            placeholder="Search products..."
            allowClear
            onSearch={(val) => setSearchText(val)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Badge count={activeFiltersCount} color="#1890ff">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(true)}
            >
              Filters
            </Button>
          </Badge>
        </Space>
      </div>

      {/* Filter Drawer (Unchanged code...) */}
      <Drawer
        title="Filter Products"
        placement="right"
        onClose={() => setFilterVisible(false)}
        open={filterVisible}
        extra={
          <Button type="link" onClick={clearFilters}>
            Clear All
          </Button>
        }
      >
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Text strong>Category</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Select Category"
              value={category}
              onChange={setCategory}
              allowClear
            >
              <Option value="FABRIC">Fabrics</Option>
              <Option value="READYMADE">Ready Made</Option>
              <Option value="TRADITIONAL">Traditional</Option>
              <Option value="ACCESSORY">Accessories</Option>
              <Option value="INNERWEAR">Innerwear</Option>
            </Select>
          </div>
          <div>
            <Text strong>Product Type</Text>
            <div style={{ marginTop: 8 }}>
              <Button
                type={isRentable ? "primary" : "default"}
                onClick={() => setIsRentable(!isRentable)}
                block
              >
                {isRentable ? "Show Rentable Only" : "Show All Items"}
              </Button>
            </div>
          </div>
          <Button type="primary" block onClick={() => setFilterVisible(false)}>
            Show Results
          </Button>
        </Space>
      </Drawer>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {products.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Badge.Ribbon
                text="Rentable"
                color="green"
                style={{
                  display: product.is_rentable ? "block" : "none",
                  zIndex: 2,
                }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/products/${product.id}`)} // Entire card clickable
                  style={{
                    height: "100%",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #f0f0f0",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  bodyStyle={{
                    padding: "16px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  cover={
                    <div
                      style={{
                        height: 280,
                        position: "relative",
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      {product.primary_image ? (
                        <img
                          alt={product.name}
                          src={product.primary_image}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1.0)")
                          }
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 40,
                          }}
                        >
                          📦
                        </div>
                      )}
                      <Tag
                        color="rgba(0,0,0,0.6)"
                        style={{
                          position: "absolute",
                          bottom: 12,
                          left: 12,
                          color: "white",
                          border: "none",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {product.category}
                      </Tag>
                    </div>
                  }
                >
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ width: "100%", flex: 1 }}
                  >
                    {/* Title */}
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        display: "block",
                        lineHeight: "1.4em",
                        height: "2.8em",
                        overflow: "hidden",
                      }}
                    >
                      {product.name}
                    </Text>

                    {/* Ratings & Orders - Fixed Alignment */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                        fontSize: 12,
                        color: "#8c8c8c",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Rate
                          disabled
                          allowHalf
                          defaultValue={product.rating || 0}
                          style={{ fontSize: 12, marginRight: 4 }}
                        />
                        <Text type="secondary">
                          ({product.review_count || 0})
                        </Text>
                      </div>
                      <Divider type="vertical" style={{ margin: 0 }} />
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        <Text>{product.people_ordered || 0} ordered</Text>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "#1890ff",
                          }}
                        >
                          {product.price_range.min
                            ? `₹${product.price_range.min.toLocaleString(
                                "en-IN"
                              )}`
                            : "Check Price"}
                        </Text>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 10 }}>
                        <Button
                          icon={
                            wishlistIds.has(product.id) ? (
                              <HeartFilled style={{ color: "#ff4d4f" }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id); // ✅ Call global function
                          }}
                          style={{ flex: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product.id}`);
                          }}
                          style={{ flex: 2 }}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Title level={4}>No products found</Title>
          <Text type="secondary">Try adjusting your search or filters</Text>
          <br />
          <Button style={{ marginTop: 16 }} onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
