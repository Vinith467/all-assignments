// src/pages/admin/AdminMeasurements.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  InputNumber,
  message,
  Typography,
  Tag,
  Descriptions
} from 'antd';
import { EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;

const AdminMeasurements = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [meters, setMeters] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPendingMeasurements();
  }, []);

  const fetchPendingMeasurements = async () => {
    try {
      const response = await axiosInstance.get('/admin/orders/pending-measurements/');
      if (response.data.success) {
        setPendingItems(response.data.pending_items);
      }
    } catch (error) {
      message.error('Failed to load pending measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleSetMeters = async () => {
    if (!meters || meters <= 0) {
      message.warning('Please enter valid meters');
      return;
    }

    setUpdating(true);
    try {
      const response = await axiosInstance.put(
        `/admin/orders/items/${selectedItem.order_item_id}/set-meters/`,
        { meters }
      );

      if (response.data.success) {
        message.success('Fabric meters set successfully');
        setModalOpen(false);
        setMeters(null);
        setSelectedItem(null);
        fetchPendingMeasurements();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to set meters');
    } finally {
      setUpdating(false);
    }
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
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
    },
    {
      title: 'Fabric Details',
      dataIndex: 'fabric_snapshot',
      key: 'fabric_snapshot',
      width: 180,
      render: (fabric) => (
        <Space direction="vertical" size={0}>
          <Text>{fabric.material}</Text>
          <Text type="secondary">{fabric.color}</Text>
        </Space>
      )
    },
    {
      title: 'Stitch Type',
      dataIndex: 'stitch_type_snapshot',
      key: 'stitch_type_snapshot',
      width: 150,
      render: (stitch) => (
        <Space direction="vertical" size={0}>
          <Text>{stitch.name}</Text>
          <Text type="secondary">₹{stitch.price}</Text>
        </Space>
      )
    },
    {
      title: 'Current Meters',
      dataIndex: 'current_meters',
      key: 'current_meters',
      width: 120,
      align: 'center',
      render: (meters) => (
        meters ? (
          <Tag color="blue">{meters}m</Tag>
        ) : (
          <Tag color="orange">Not Set</Tag>
        )
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedItem(record);
            setMeters(record.current_meters || null);
            setModalOpen(true);
          }}
        >
          Set Meters
        </Button>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Measurements Pending</Title>

      <Card>
        {pendingItems.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>All Caught Up!</Title>
            <Text type="secondary">No measurements pending at the moment.</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={pendingItems}
            rowKey="order_item_id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items pending`
            }}
          />
        )}
      </Card>

      {/* Set Meters Modal */}
      <Modal
        title="Set Fabric Meters"
        open={modalOpen}
        onOk={handleSetMeters}
        onCancel={() => {
          setModalOpen(false);
          setMeters(null);
          setSelectedItem(null);
        }}
        confirmLoading={updating}
        okText="Set Meters"
        width={600}
      >
        {selectedItem && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, border: '1px solid #91d5ff' }}>
              <Text>
                📏 <strong>Note:</strong> After taking measurements, enter the fabric meters required 
                for stitching. This will update the order and make it ready for stitching.
              </Text>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Order Number">
                <Text strong>{selectedItem.order_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedItem.customer}
                <br />
                <Text type="secondary">{selectedItem.customer_phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Product">
                {selectedItem.product_name}
              </Descriptions.Item>
              <Descriptions.Item label="Fabric">
                {selectedItem.fabric_snapshot.material} - {selectedItem.fabric_snapshot.color}
                <br />
                <Text type="secondary">
                  ₹{selectedItem.fabric_snapshot.price_per_meter}/meter
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Stitch Type">
                {selectedItem.stitch_type_snapshot.name}
                <br />
                <Text type="secondary">
                  ₹{selectedItem.stitch_type_snapshot.price}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Enter Fabric Meters Required: <Text type="danger">*</Text>
              </Text>
              <InputNumber
                min={0.5}
                max={10}
                step={0.5}
                value={meters}
                onChange={setMeters}
                style={{ width: '100%' }}
                size="large"
                placeholder="e.g., 2.5"
                addonAfter="meters"
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                Typical values: Shirt (2-2.5m), Pant (2.5-3m), Kurta (3-4m)
              </Text>
            </div>

            {meters && (
              <div style={{ background: '#f6ffed', padding: 12, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Space direction="vertical" size={4}>
                  <Text strong>Cost Calculation:</Text>
                  <Text>
                    Fabric: {meters}m × ₹{selectedItem.fabric_snapshot.price_per_meter} = 
                    <Text strong> ₹{(meters * selectedItem.fabric_snapshot.price_per_meter).toFixed(2)}</Text>
                  </Text>
                  <Text>
                    Stitching: <Text strong>₹{selectedItem.stitch_type_snapshot.price}</Text>
                  </Text>
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    Total: ₹{(
                      (meters * selectedItem.fabric_snapshot.price_per_meter) + 
                      selectedItem.stitch_type_snapshot.price
                    ).toFixed(2)}
                  </Text>
                </Space>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AdminMeasurements;