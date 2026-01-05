// src/pages/admin/AdminRentals.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Select,
  InputNumber,
  DatePicker,
  message,
  Typography,
  Tag,
  Descriptions,
  Divider
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from '../../api/axios';

const { Option } = Select;
const { Title, Text } = Typography;

const AdminRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState(null);
  const [condition, setCondition] = useState('CLEAN');
  const [damageFee, setDamageFee] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await axiosInstance.get('/admin/rentals/active/');
      if (response.data.success) {
        setRentals(response.data.rentals);
      }
    } catch (error) {
      message.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!returnDate) {
      message.warning('Please select return date');
      return;
    }

    setProcessing(true);
    try {
      const response = await axiosInstance.post(
        `/admin/rentals/${selectedRental.rental_id}/return/`,
        {
          actual_return_date: returnDate.format('YYYY-MM-DD'),
          condition_status: condition,
          damage_fee: damageFee
        }
      );

      if (response.data.success) {
        message.success('Rental return processed successfully');
        setReturnModalOpen(false);
        resetModal();
        fetchRentals();
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to process return');
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedRental(null);
    setReturnDate(null);
    setCondition('CLEAN');
    setDamageFee(0);
  };

  const calculatePlannedDays = () => {
    // This is the original rental duration that customer agreed to pay for
    return selectedRental ? selectedRental.days_rented : 0;
  };

  const calculateLateDays = () => {
    if (!returnDate || !selectedRental) return 0;
    const expectedReturn = dayjs(selectedRental.expected_return_date);
    const lateDays = returnDate.diff(expectedReturn, 'day');
    return Math.max(0, lateDays); // Only positive late days
  };

  const calculateRefund = () => {
    if (!selectedRental || !returnDate) return 0;
    // Rental cost is based on planned days (what customer agreed to)
    const rentalCost = selectedRental.rent_per_day * selectedRental.days_rented;
    // Late fee is additional charges
    const lateFee = calculateLateDays() * selectedRental.rent_per_day;
    const totalDeductions = rentalCost + lateFee + damageFee;
    const refund = selectedRental.deposit_amount - totalDeductions;
    // Refund can never be negative - customer pays at most the deposit
    return Math.max(0, refund);
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
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
      title: 'Deposit',
      dataIndex: 'deposit_amount',
      key: 'deposit_amount',
      width: 120,
      render: (amount) => `₹${amount.toLocaleString('en-IN')}`
    },
    {
      title: 'Rent/Day',
      dataIndex: 'rent_per_day',
      key: 'rent_per_day',
      width: 100,
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Expected Return',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
      width: 130,
      render: (date) => new Date(date).toLocaleDateString('en-IN')
    },
    {
      title: 'Days Rented',
      dataIndex: 'days_rented',
      key: 'days_rented',
      width: 100,
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'is_overdue',
      key: 'is_overdue',
      width: 100,
      render: (overdue) => (
        overdue ? (
          <Tag color="red">Overdue</Tag>
        ) : (
          <Tag color="green">On Time</Tag>
        )
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => {
            setSelectedRental(record);
            setReturnDate(dayjs());
            setReturnModalOpen(true);
          }}
        >
          Process Return
        </Button>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Active Rentals</Title>

      <Card>
        {rentals.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>No Active Rentals</Title>
            <Text type="secondary">All rentals have been returned.</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={rentals}
            rowKey="rental_id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} active rentals`
            }}
          />
        )}
      </Card>

      {/* Process Return Modal */}
      <Modal
        title="Process Rental Return"
        open={returnModalOpen}
        onOk={handleProcessReturn}
        onCancel={() => {
          setReturnModalOpen(false);
          resetModal();
        }}
        confirmLoading={processing}
        okText="Process Return"
        width={700}
      >
        {selectedRental && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Order" span={2}>
                <Text strong>{selectedRental.order_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedRental.customer}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedRental.customer_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Product" span={2}>
                {selectedRental.product_name}
              </Descriptions.Item>
              <Descriptions.Item label="Deposit">
                ₹{selectedRental.deposit_amount.toLocaleString('en-IN')}
              </Descriptions.Item>
              <Descriptions.Item label="Rent/Day">
                ₹{selectedRental.rent_per_day}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Return">
                {new Date(selectedRental.expected_return_date).toLocaleDateString('en-IN')}
              </Descriptions.Item>
              <Descriptions.Item label="Days Rented">
                {selectedRental.days_rented} days
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Actual Return Date: <Text type="danger">*</Text>
              </Text>
              <DatePicker
                value={returnDate}
                onChange={setReturnDate}
                style={{ width: '100%' }}
                size="large"
                format="DD MMMM YYYY"
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Product Condition: <Text type="danger">*</Text>
              </Text>
              <Select
                value={condition}
                onChange={setCondition}
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="CLEAN">Clean (No issues)</Option>
                <Option value="DIRTY">Dirty (Needs cleaning)</Option>
                <Option value="DAMAGED">Damaged (Requires repair)</Option>
              </Select>
            </div>

            {condition === 'DAMAGED' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Damage Fee:
                </Text>
                <InputNumber
                  min={0}
                  value={damageFee}
                  onChange={setDamageFee}
                  style={{ width: '100%' }}
                  size="large"
                  prefix="₹"
                  placeholder="Enter damage repair cost"
                />
              </div>
            )}

            {returnDate && (
              <>
                <Divider />
                <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: 16 }}>Refund Calculation:</Text>
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Text>Deposit Paid:</Text>
                      <Text strong>₹{selectedRental.deposit_amount.toLocaleString('en-IN')}</Text>
                    </Space>
                    <Divider style={{ margin: '4px 0' }} dashed />
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Text>Rental Period:</Text>
                      <Text>{calculatePlannedDays()} days (Order to Expected Return)</Text>
                    </Space>
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Text>Rental Cost:</Text>
                      <Text type="danger">- ₹{(selectedRental.rent_per_day * calculatePlannedDays()).toLocaleString('en-IN')}</Text>
                    </Space>
                    {calculateLateDays() > 0 && (
                      <>
                        <Space justify="space-between" style={{ width: '100%' }}>
                          <Text type="warning">Late Return ({calculateLateDays()} days):</Text>
                          <Text type="danger">- ₹{(selectedRental.rent_per_day * calculateLateDays()).toLocaleString('en-IN')}</Text>
                        </Space>
                      </>
                    )}
                    {damageFee > 0 && (
                      <Space justify="space-between" style={{ width: '100%' }}>
                        <Text>Damage Fee:</Text>
                        <Text type="danger">- ₹{damageFee.toLocaleString('en-IN')}</Text>
                      </Space>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Text strong style={{ fontSize: 16 }}>Refund Amount:</Text>
                      <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                        ₹{calculateRefund().toLocaleString('en-IN')}
                      </Text>
                    </Space>
                    {calculateLateDays() > 0 && (
                      <div style={{ background: '#fff7e6', padding: 8, borderRadius: 4, marginTop: 8 }}>
                        <Text type="warning" style={{ fontSize: 12 }}>
                          ⚠️ Item returned {calculateLateDays()} day(s) late (after {new Date(selectedRental.expected_return_date).toLocaleDateString('en-IN')})
                        </Text>
                      </div>
                    )}
                    {returnDate.isBefore(dayjs(selectedRental.expected_return_date)) && (
                      <div style={{ background: '#e6f7ff', padding: 8, borderRadius: 4, marginTop: 8 }}>
                        <Text type="success" style={{ fontSize: 12 }}>
                          ✓ Item returned early - no late fees
                        </Text>
                      </div>
                    )}
                    {calculateRefund() === 0 && (
                      <div style={{ background: '#fff1f0', padding: 8, borderRadius: 4, marginTop: 8 }}>
                        <Text type="danger" style={{ fontSize: 12 }}>
                          ⚠️ No refund - total charges equal or exceed deposit
                        </Text>
                      </div>
                    )}
                  </Space>
                </div>
              </>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AdminRentals;