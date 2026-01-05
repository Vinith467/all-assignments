// src/pages/Bookings.jsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  DatePicker, 
  Select, 
  Input, 
  List, 
  Tag, 
  Space, 
  Typography, 
  Divider, 
  Modal, 
  message,
  Empty,
  Row,
  Col,
  Spin
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from '../api/axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();

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
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await axiosInstance.get('/bookings/available-slots/', {
        params: { date: date.format('YYYY-MM-DD') }
      });
      if (response.data.success) {
        setAvailableSlots(response.data.available_slots);
      }
    } catch (error) {
      message.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleCreateBooking = async (values) => {
    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/bookings/create/', {
        date: values.date.format('YYYY-MM-DD'),
        time_slot: values.time_slot,
        notes: values.notes || ''
      });

      if (response.data.success) {
        message.success('Booking created successfully!');
        setModalOpen(false);
        form.resetFields();
        setSelectedDate(null);
        setAvailableSlots([]);
        fetchBookings();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axiosInstance.delete(`/bookings/${bookingId}/cancel/`);
      if (response.data.success) {
        message.success('Booking cancelled');
        fetchBookings();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to cancel booking');
    }
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

  const getStatusIcon = (status) => {
    if (status === 'COMPLETED') return <CheckCircleOutlined />;
    if (status === 'CONFIRMED') return <CalendarOutlined />;
    return <ClockCircleOutlined />;
  };

  const disabledDate = (current) => {
    // Can't book for past dates
    return current && current < dayjs().startOf('day');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>My Bookings</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            size="large"
          >
            Book Appointment
          </Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24, background: '#e6f7ff', borderColor: '#91d5ff' }}>
        <Space orientation="vertical" size="small">
          <Text strong style={{ fontSize: 16 }}>📏 Why Book a Measurement?</Text>
          <Text>
            For custom tailoring and stitching services, we need your precise measurements 
            to ensure a perfect fit. Our expert tailors will take detailed measurements 
            during your appointment.
          </Text>
        </Space>
      </Card>

      {bookings.length === 0 ? (
        <Card>
          <Empty 
            description="No bookings yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<CalendarOutlined />}
              onClick={() => setModalOpen(true)}
              size="large"
            >
              Book Your First Appointment
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          dataSource={bookings}
          renderItem={(booking) => (
            <Card 
              style={{ marginBottom: 16 }}
             styles={{ padding: 16 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                    <Space wrap>
                      <CalendarOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                      <Text strong style={{ fontSize: 16 }}>
                        {new Date(booking.date).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                    </Space>

                    <Space wrap>
                      <ClockCircleOutlined />
                      <Text>{booking.time_slot}</Text>
                      <Divider orientation="vertical" />
                      <Tag 
                        color={getStatusColor(booking.status)} 
                        icon={getStatusIcon(booking.status)}
                      >
                        {booking.status}
                      </Tag>
                      <Divider orientation="vertical" />
                      <Tag color={booking.measurement_status === 'completed' ? 'green' : 'orange'}>
                        {booking.measurement_status === 'completed' ? '✓ Measured' : 'Pending'}
                      </Tag>
                    </Space>

                    {booking.notes && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <strong>Notes:</strong> {booking.notes}
                      </Text>
                    )}

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Booked on {new Date(booking.created_at).toLocaleDateString('en-IN')}
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  {booking.status === 'PENDING' && (
                    <Button 
                      danger 
                      onClick={() => {
                        Modal.confirm({
                          title: 'Cancel Booking',
                          content: 'Are you sure you want to cancel this appointment?',
                          okText: 'Yes, Cancel',
                          cancelText: 'No',
                          onOk: () => handleCancelBooking(booking.id)
                        });
                      }}
                    >
                      Cancel Booking
                    </Button>
                  )}
                  {booking.status === 'COMPLETED' && booking.measurement_status === 'completed' && (
                    <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
                      <CheckCircleOutlined /> Measurements Recorded
                    </Tag>
                  )}
                </Col>
              </Row>
            </Card>
          )}
        />
      )}

      {/* Create Booking Modal */}
      <Modal
        title="Book Measurement Appointment"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setSelectedDate(null);
          setAvailableSlots([]);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBooking}
        >
          <Form.Item
            name="date"
            label="Select Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              disabledDate={disabledDate}
              onChange={handleDateChange}
              format="DD MMMM YYYY"
            />
          </Form.Item>

          {selectedDate && (
            <Form.Item
              name="time_slot"
              label="Select Time Slot"
              rules={[{ required: true, message: 'Please select a time slot' }]}
            >
              <Select
                size="large"
                placeholder="Choose available slot"
                loading={loadingSlots}
                disabled={loadingSlots || availableSlots.length === 0}
              >
                {availableSlots.map(slot => (
                  <Option key={slot} value={slot}>
                    {slot}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedDate && availableSlots.length === 0 && !loadingSlots && (
            <div style={{ 
              background: '#fff1f0', 
              border: '1px solid #ffa39e',
              padding: 12, 
              borderRadius: 4,
              marginBottom: 16
            }}>
              <Text type="danger">
                No slots available for this date. Please select another date.
              </Text>
            </div>
          )}

          <Form.Item
            name="notes"
            label="Additional Notes (Optional)"
          >
            <TextArea
              rows={3}
              placeholder="Any specific requirements or notes for the tailor..."
            />
          </Form.Item>

          <Form.Item>
            <Space size="middle">
              <Button
                onClick={() => {
                  setModalOpen(false);
                  form.resetFields();
                  setSelectedDate(null);
                  setAvailableSlots([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting}
                disabled={!selectedDate || availableSlots.length === 0}
              >
                Confirm Booking
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
          <Text strong style={{ fontSize: 13 }}>ℹ️ Important Information:</Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            <li><Text style={{ fontSize: 12 }}>Appointment duration: ~30 minutes</Text></li>
            <li><Text style={{ fontSize: 12 }}>Please arrive 5 minutes early</Text></li>
            <li><Text style={{ fontSize: 12 }}>Bring any reference garments if available</Text></li>
            <li><Text style={{ fontSize: 12 }}>You can cancel up to 24 hours before</Text></li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;