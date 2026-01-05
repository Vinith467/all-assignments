// src/pages/admin/Dashboard.jsx
import { Row, Col, Card, Statistic, List, Tag, Space, Typography } from 'antd';
import {
  ShoppingOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeRentals: 0,
    pendingBookings: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersRes = await axiosInstance.get('/admin/orders/all/');
      if (ordersRes.data.success) {
        const orders = ordersRes.data.orders;
        setRecentOrders(orders.slice(0, 5));

        // Calculate stats
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'PLACED' || o.status === 'PROCESSING').length,
          completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
          totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0)
        }));
      }

      // Fetch rentals
      const rentalsRes = await axiosInstance.get('/admin/rentals/active/');
      if (rentalsRes.data.success) {
        setStats(prev => ({
          ...prev,
          activeRentals: rentalsRes.data.total_active_rentals
        }));
      }

      // Fetch bookings
      const bookingsRes = await axiosInstance.get('/bookings/');
      if (bookingsRes.data.success) {
        const bookings = bookingsRes.data.bookings;
        setStats(prev => ({
          ...prev,
          pendingBookings: bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLACED': 'blue',
      'PROCESSING': 'orange',
      'STITCHING': 'purple',
      'READY': 'green',
      'COMPLETED': 'success'
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Completed Orders"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Rentals"
              value={stats.activeRentals}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Bookings"
              value={stats.pendingBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="₹"
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card title="Recent Orders" loading={loading}>
        <List
          dataSource={recentOrders}
          renderItem={(order) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{order.order_number}</Text>
                    <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Customer: {order.customer}</Text>
                    <Text type="secondary">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </Text>
                  </Space>
                }
              />
              <div>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </Text>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Dashboard;