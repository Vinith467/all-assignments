// src/pages/admin/AdminOrders.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Input,
  message,
  Badge,
  Descriptions,
  Divider,
  Typography,
  Row,
  Col
} from 'antd';
import { EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // ✅ State for filtered list
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // ✅ Filter State
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Effect to apply filter whenever orders or filter changes
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === statusFilter);
      setFilteredOrders(filtered);
    }
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/admin/orders/all/');
      if (response.data.success) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders); // Initialize filtered list
      }
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setDetailModalOpen(true);
      }
    } catch (error) {
      message.error('Failed to load order details');
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      message.warning('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      const response = await axiosInstance.put(
        `/admin/orders/${selectedOrder.order_id}/update-status/`,
        {
          status: newStatus,
          note: statusNote
        }
      );

      if (response.data.success) {
        message.success('Status updated successfully');
        setStatusModalOpen(false);
        setNewStatus('');
        setStatusNote('');
        fetchOrders(); // Refresh list
        if (detailModalOpen) {
          fetchOrderDetail(selectedOrder.order_id); // Refresh detail view
        }
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLACED': 'blue',
      'PROCESSING': 'orange',
      'STITCHING': 'purple',
      'READY': 'green',
      'PICKED_UP': 'cyan',
      'COMPLETED': 'success',
      'CANCELLED': 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      fixed: 'left',
      width: 180,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
    },
    {
      title: 'Phone',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Items',
      dataIndex: 'items_count',
      key: 'items_count',
      width: 80,
      align: 'center'
    },
    {
      title: 'Pending Measurements',
      dataIndex: 'pending_measurements',
      key: 'pending_measurements',
      width: 150,
      align: 'center',
      render: (count) => (
        count > 0 ? (
          <Badge count={count} style={{ backgroundColor: '#faad14' }} />
        ) : (
          <Text type="secondary">None</Text>
        )
      )
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          ₹{amount.toLocaleString('en-IN')}
        </Text>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('en-IN')
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => fetchOrderDetail(record.order_id)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              fetchOrderDetail(record.order_id);
              setTimeout(() => setStatusModalOpen(true), 300);
            }}
          >
            Status
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Orders Management</Title>
        
        {/* ✅ FILTER DROPDOWN */}
        <Space>
          <FilterOutlined />
          <span style={{ fontWeight: 500 }}>Filter Status:</span>
          <Select
            defaultValue="ALL"
            style={{ width: 200 }}
            onChange={setStatusFilter}
            value={statusFilter}
          >
            <Option value="ALL">All Orders</Option>
            <Option value="PLACED">Placed</Option>
            <Option value="PROCESSING">Processing</Option>
            <Option value="STITCHING">Stitching</Option>
            <Option value="READY">Ready</Option>
            <Option value="PICKED_UP">Picked Up</Option>
            <Option value="COMPLETED">Completed</Option>
            <Option value="CANCELLED">Cancelled</Option>
          </Select>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders} // ✅ Use filtered data
          rowKey="order_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.order_number}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        width={900}
        footer={[
          <Button key="status" type="primary" onClick={() => setStatusModalOpen(true)}>
            Update Status
          </Button>,
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        ]}
      >
        {selectedOrder && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Order Number" span={2}>
                <Text strong>{selectedOrder.order_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  ₹{selectedOrder.total_amount.toLocaleString('en-IN')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.address?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.address?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {selectedOrder.address?.address_line}, {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Order Items</Divider>

            {selectedOrder.items.map((item, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                {/* Image + Details Flex Layout */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  
                  {/* Image Container */}
                  <div style={{
                    width: 60,
                    height: 60,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                    flexShrink: 0
                  }}>
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.product_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 20 }}>📦</span>
                    )}
                  </div>

                  {/* Details Container */}
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{item.product_name}</Text>
                    <Space wrap>
                      <Tag>{item.product_category}</Tag>
                      {item.purchase_type === 'RENT' && <Tag color="green">RENTAL</Tag>}
                      {item.stitching_status !== 'NOT_APPLICABLE' && (
                        <Tag color="blue">{item.stitching_status}</Tag>
                      )}
                    </Space>
                    
                    {/* Variant Info */}
                    {item.variant_snapshot && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.variant_snapshot.size && `Size: ${item.variant_snapshot.size}, `}
                        Color: {item.variant_snapshot.color}
                      </Text>
                    )}

                    {/* Stitch/Fabric Info */}
                    {item.fabric_snapshot && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Fabric: {item.fabric_snapshot.material} - {item.fabric_snapshot.color}
                      </Text>
                    )}

                    <Text>Quantity: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</Text>
                  </Space>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalOpen}
        onOk={handleUpdateStatus}
        onCancel={() => {
          setStatusModalOpen(false);
          setNewStatus('');
          setStatusNote('');
        }}
        confirmLoading={updating}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Current Status: </Text>
            <Tag color={getStatusColor(selectedOrder?.status)}>
              {selectedOrder?.status}
            </Tag>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              New Status:
            </Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Select new status"
              value={newStatus}
              onChange={setNewStatus}
              size="large"
            >
              <Option value="PLACED">PLACED</Option>
              <Option value="PROCESSING">PROCESSING</Option>
              <Option value="STITCHING">STITCHING</Option>
              <Option value="READY">READY</Option>
              <Option value="PICKED_UP">PICKED UP</Option>
              <Option value="COMPLETED">COMPLETED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
            </Select>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Note (Optional):
            </Text>
            <TextArea
              rows={3}
              placeholder="Add a note about this status change..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AdminOrders;