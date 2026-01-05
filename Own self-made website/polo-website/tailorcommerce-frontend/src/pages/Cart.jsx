// src/pages/Cart.jsx

import { useState, useEffect } from 'react';
import { 
  Card, 
  Empty, 
  Button, 
  List, 
  InputNumber, 
  message, 
  Space, 
  Typography, 
  Divider, 
  Popconfirm,
  Tag,
  Row,
  Col,
  Image
} from 'antd';
import { 
  DeleteOutlined, 
  ShoppingOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useCart } from '../context/CartContext';

const { Title, Text } = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart/');
      if (response.data.success) {
        setCart(response.data.cart);
        await refreshCart();
      }
    } catch (error) {
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      const response = await axiosInstance.put(`/cart/update/${itemId}/`, {
        quantity: newQuantity,
      });

      if (response.data.success) {
        message.success('Cart updated');
        await fetchCart();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update cart');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await axiosInstance.delete(`/cart/remove/${itemId}/`);

      if (response.data.success) {
        message.success('Item removed');
        await fetchCart();
      }
    } catch (error) {
      message.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <Card loading={true} />;
  }

  if (!cart || cart.items_count === 0) {
    return (
      <Card>
        <Empty 
          description="Your cart is empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/products')}
            size="large"
          >
            Start Shopping
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Shopping Cart ({cart.items_count} items)</Title>

      <Row gutter={[24, 24]}>
        {/* Cart Items */}
        <Col xs={24} lg={16}>
          {cart.items.map((item) => (
            <Card 
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: 16 }}
              key={item.id}
            >
              <Row gutter={16} align="middle">
                {/* Product Image */}
                <Col xs={24} sm={6}>
                  <div style={{ 
                    width: '100%', 
                    height: 120, 
                    background: '#f5f5f5',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '📦';
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 48, color: '#d9d9d9' }}>
                        📦
                      </div>
                    )}
                  </div>
                </Col>

                {/* Product Info */}
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {item.product.name}
                    </Title>
                    
                    <Space wrap size="small">
                      <Tag>{item.product.category}</Tag>
                      {item.purchase_type === 'RENT' && (
                        <Tag color="green">RENTAL - {item.rental_days} days</Tag>
                      )}
                    </Space>

                    {/* Variant Info */}
                    {item.variant && (
                      <Text type="secondary">
                        {item.variant.size && `Size: ${item.variant.size}, `}
                        Color: {item.variant.color}
                      </Text>
                    )}

                    {/* ✅ Detailed Fabric Billing Breakdown */}
                    {item.fabric && (
                      <div style={{ 
                        background: '#f0f9ff', 
                        padding: 12, 
                        borderRadius: 6,
                        marginTop: 8,
                        border: '1px solid #91d5ff'
                      }}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text strong style={{ fontSize: 13, color: '#0050b3' }}>
                            📏 Fabric Details
                          </Text>
                          
                          <Divider style={{ margin: '8px 0' }} />
                          
                          <Text style={{ fontSize: 12 }}>
                            Material: <Text strong>{item.fabric.material}</Text> - {item.fabric.color}
                          </Text>
                          
                          {/* Fabric Cost Calculation */}
                          {item.fabric.meters && (
                            <div style={{ marginTop: 4 }}>
                              <Text style={{ fontSize: 12, display: 'block' }}>
                                Fabric: {item.fabric.meters}m × ₹{item.price_snapshot}/m = 
                                <Text strong style={{ color: '#1890ff' }}> ₹{(item.fabric.meters * item.price_snapshot).toLocaleString('en-IN')}</Text>
                              </Text>
                            </div>
                          )}
                          
                          {/* Stitching Cost */}
                          {item.stitch_type && (
                            <Text style={{ fontSize: 12, display: 'block' }}>
                              Stitching: {item.stitch_type.name} = 
                              <Text strong style={{ color: '#1890ff' }}> ₹{item.stitch_type.price.toLocaleString('en-IN')}</Text>
                            </Text>
                          )}
                          
                          <Divider style={{ margin: '8px 0' }} />
                          
                          {/* Total for this item */}
                          <Text strong style={{ fontSize: 14, color: '#0050b3' }}>
                            Item Total: ₹{item.subtotal.toLocaleString('en-IN')}
                          </Text>
                        </Space>
                      </div>
                    )}

                    {/* Regular price for non-fabric items */}
                    {!item.fabric && (
                      <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                        ₹{item.price_snapshot.toLocaleString('en-IN')} each
                      </Text>
                    )}
                  </Space>
                </Col>

                {/* Quantity & Actions */}
                <Col xs={24} sm={6}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Only show quantity control for non-fabric items */}
                    {!item.fabric && (
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                          Quantity:
                        </Text>
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.id, value)}
                          loading={updating[item.id]}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}

                    <div>
                      <Text strong style={{ display: 'block', fontSize: 16 }}>
                        Subtotal: ₹{item.subtotal.toLocaleString('en-IN')}
                      </Text>
                    </div>

                    <Popconfirm
                      title="Remove this item?"
                      onConfirm={() => removeItem(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button 
                        danger 
                        icon={<DeleteOutlined />}
                        block
                      >
                        Remove
                      </Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>

        {/* Order Summary */}
        <Col xs={24} lg={8}>
          <Card 
            title="Order Summary"
            style={{ position: 'sticky', top: 80 }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space justify="space-between" style={{ width: '100%' }}>
                  <Text>Items ({cart.items_count}):</Text>
                  <Text>₹{cart.total.toLocaleString('en-IN')}</Text>
                </Space>
              </div>

              <Divider style={{ margin: 0 }} />

              <div>
                <Space justify="space-between" style={{ width: '100%' }}>
                  <Text strong style={{ fontSize: 18 }}>Total:</Text>
                  <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                    ₹{cart.total.toLocaleString('en-IN')}
                  </Text>
                </Space>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={handleCheckout}
                block
              >
                Proceed to Checkout
              </Button>

              <Button
                onClick={() => navigate('/products')}
                block
              >
                Continue Shopping
              </Button>

              <Divider style={{ margin: 0 }} />

              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  💡 Free pickup from store
                  <br />
                  🔒 Secure checkout
                  <br />
                  ✂️ Expert tailoring included
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cart;
