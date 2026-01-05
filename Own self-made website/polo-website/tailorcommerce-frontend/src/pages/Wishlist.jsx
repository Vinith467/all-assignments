import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Empty, Spin, Tag, message } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const { Title, Text } = Typography;

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get('/wishlist/');
      if (response.data.success) {
        setItems(response.data.wishlist);
      }
    } catch (error) {
      console.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      const response = await axiosInstance.post('/wishlist/toggle/', { product_id: productId });
      if (response.data.success) {
        message.success('Removed from wishlist');
        fetchWishlist(); // Refresh list
      }
    } catch (error) {
      message.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      <Title level={2}>My Wishlist ({items.length})</Title>

      {items.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Your wishlist is empty"
          >
            <Button type="primary" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {items.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, overflow: 'hidden' }}
                bodyStyle={{ padding: 16 }}
                cover={
                  <div style={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 40 }}>📦</span>
                    )}
                    {item.is_rentable && (
                        <Tag color="green" style={{ position: 'absolute', top: 10, right: 10 }}>Rentable</Tag>
                    )}
                  </div>
                }
                onClick={() => navigate(`/products/${item.product_id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div style={{ overflow: 'hidden' }}>
                        <Text strong style={{ fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {item.name}
                        </Text>
                        <Tag color="blue">{item.category}</Tag>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
                        {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Check Price'}
                    </Text>
                    <Button 
                        danger 
                        shape="circle" 
                        icon={<DeleteOutlined />} 
                        onClick={(e) => removeFromWishlist(e, item.product_id)} 
                    />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Wishlist;