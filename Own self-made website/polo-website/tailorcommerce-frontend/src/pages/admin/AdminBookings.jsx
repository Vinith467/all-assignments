// src/pages/admin/AdminBookings.jsx

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Upload,
  Input,
  InputNumber,
  message,
  Typography,
  Descriptions,
  Divider,
  Image
} from 'antd';
import {
  EyeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [measurementData, setMeasurementData] = useState('');
  
  // NEW: Fabric meters states
  const [shirtMeters, setShirtMeters] = useState('');
  const [pantMeters, setPantMeters] = useState('');
  const [kurtaMeters, setKurtaMeters] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axiosInstance.get('/bookings/');
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMeasurement = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a photo');
      return;
    }

    // Validate at least one meter is set
    if (!shirtMeters && !pantMeters && !kurtaMeters) {
      message.warning('Please set at least one fabric meter value');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      const file = fileList[0].originFileObj || fileList[0];
      formData.append('measurement_photo', file);
      
      if (measurementData) {
        formData.append('measurement_data', measurementData);
      }
      
      // Add fabric meters
      if (shirtMeters) formData.append('shirt_meters', shirtMeters);
      if (pantMeters) formData.append('pant_meters', pantMeters);
      if (kurtaMeters) formData.append('kurta_meters', kurtaMeters);

      const response = await axiosInstance.post(
        `/admin/bookings/${selectedBooking.id}/upload-measurement/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        message.success('Measurement uploaded successfully!');
        setUploadModalOpen(false);
        resetUploadForm();
        fetchBookings();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to upload measurement');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setFileList([]);
    setMeasurementData('');
    setShirtMeters('');
    setPantMeters('');
    setKurtaMeters('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'orange',
      'CONFIRMED': 'blue',
      'COMPLETED': 'green',
      'CANCELLED': 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      title: 'Time Slot',
      dataIndex: 'time_slot',
      key: 'time_slot',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'COMPLETED' ? <CheckCircleOutlined /> : <ClockCircleOutlined />
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Measurement',
      dataIndex: 'measurement_status',
      key: 'measurement_status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'success' : 'warning'}>
          {status === 'completed' ? '✓ Recorded' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || <Text type="secondary">No notes</Text>
    },
    {
      title: 'Booked On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('en-IN')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record);
              setDetailModalOpen(true);
            }}
          >
            View
          </Button>
          {record.measurement_status !== 'completed' && record.status !== 'CANCELLED' && (
            <Button
              size="small"
              icon={<UploadOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setUploadModalOpen(true);
              }}
            >
              Upload
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Bookings Management</Title>

      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} bookings`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Booking Details"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedBooking(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedBooking && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Date">
                {new Date(selectedBooking.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Time Slot">
                {selectedBooking.time_slot}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Measurement Status">
                <Tag color={selectedBooking.measurement_status === 'completed' ? 'success' : 'warning'}>
                  {selectedBooking.measurement_status === 'completed' ? '✓ Recorded' : 'Pending'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Notes">
                {selectedBooking.notes || <Text type="secondary">No notes</Text>}
              </Descriptions.Item>
            </Descriptions>

            {selectedBooking.measurement_photo_url && (
              <>
                <Divider>Measurement Photo</Divider>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 8,
                  textAlign: 'center'
                }}>
                  <Image
                    src={selectedBooking.measurement_photo_url}
                    alt="Measurement Photo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 500,
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    preview={{
                      mask: (
                        <Space direction="vertical">
                          <EyeOutlined style={{ fontSize: 24 }} />
                          <Text style={{ color: 'white' }}>Click to view full screen</Text>
                        </Space>
                      )
                    }}
                  />
                  <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                    📸 Click image to view in full screen
                  </Text>
                </div>
              </>
            )}
          </Space>
        )}
      </Modal>

      {/* Upload Measurement Modal */}
      <Modal
        title="Upload Measurement Photo"
        open={uploadModalOpen}
        onOk={handleUploadMeasurement}
        onCancel={() => {
          setUploadModalOpen(false);
          resetUploadForm();
        }}
        confirmLoading={uploading}
        okText="Upload & Save"
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ background: '#fffbe6', padding: 12, borderRadius: 8, border: '1px solid #ffe58f' }}>
            <Text>
              📸 <strong>Note:</strong> Upload a clear photo of the handwritten measurements. 
              This will be stored securely on Cloudinary.
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Measurement Photo: <Text type="danger">*</Text>
            </Text>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('You can only upload image files!');
                  return false;
                }
                
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }
                
                setFileList([file]);
                return false;
              }}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Select Photo</div>
                </div>
              )}
            </Upload>
          </div>

          <Divider>Fabric Requirements</Divider>
          
          <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, border: '1px solid #91d5ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
              📏 Set Standard Fabric Meters for This Customer:
            </Text>
            
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text style={{ display: 'block', marginBottom: 4 }}>
                  Shirt Fabric (meters):
                </Text>
                <InputNumber
                  min={1.5}
                  max={4}
                  step={0.5}
                  value={shirtMeters}
                  onChange={setShirtMeters}
                  style={{ width: '100%' }}
                  placeholder="e.g., 2.5"
                  addonAfter="m"
                />
              </div>
              
              <div>
                <Text style={{ display: 'block', marginBottom: 4 }}>
                  Pant Fabric (meters):
                </Text>
                <InputNumber
                  min={2}
                  max={5}
                  step={0.5}
                  value={pantMeters}
                  onChange={setPantMeters}
                  style={{ width: '100%' }}
                  placeholder="e.g., 3.0"
                  addonAfter="m"
                />
              </div>
              
              <div>
                <Text style={{ display: 'block', marginBottom: 4 }}>
                  Kurta Fabric (meters):
                </Text>
                <InputNumber
                  min={2.5}
                  max={6}
                  step={0.5}
                  value={kurtaMeters}
                  onChange={setKurtaMeters}
                  style={{ width: '100%' }}
                  placeholder="e.g., 4.0"
                  addonAfter="m"
                />
              </div>
            </Space>
            
            <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
              💡 These meters will be used when customer orders fabric with stitching.
              Set at least one value.
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Additional Notes (Optional):
            </Text>
            <TextArea
              rows={3}
              placeholder="Enter any additional measurement notes..."
              value={measurementData}
              onChange={(e) => setMeasurementData(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AdminBookings;