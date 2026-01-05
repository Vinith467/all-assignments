// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Form, Input, Button, Tabs, 
  List, Tag, Modal, Checkbox, message, Typography, Badge, Space, Spin 
} from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  PhoneOutlined, 
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Address States
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();

  // Profile Form State
  const [profileForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const response = await axiosInstance.get('/auth/addresses/');
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      console.error('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put('/auth/profile/update/', values);
      if (response.data.success) {
        message.success('Profile updated successfully');
      }
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (values) => {
    try {
      if (editingAddress) {
        await axiosInstance.put(`/auth/addresses/${editingAddress.id}/`, values);
        message.success('Address updated');
      } else {
        await axiosInstance.post('/auth/addresses/', values);
        message.success('Address added');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingAddress(null);
      fetchAddresses();
    } catch (error) {
      message.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axiosInstance.delete(`/auth/addresses/${id}/`);
      message.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      message.error('Failed to delete address');
    }
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    if (address) {
      form.setFieldsValue(address);
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const ProfileTab = () => (
    <div style={{ maxWidth: 600 }}>
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleUpdateProfile}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="first_name" label="First Name">
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="last_name" label="Last Name">
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="email" label="Email">
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item name="phone" label="Phone Number">
          <Input prefix={<PhoneOutlined />} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const AddressesTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Saved Addresses</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddressModal()}>
          Add New
        </Button>
      </div>

      {addressLoading ? <Spin /> : (
        <Row gutter={[16, 16]}>
          {addresses.map(addr => (
            <Col xs={24} md={12} key={addr.id}>
              <Badge.Ribbon 
                text="Default" 
                color="blue" 
                style={{ display: addr.is_default ? 'block' : 'none' }}
              >
                <Card 
                  hoverable
                  actions={[
                    <EditOutlined key="edit" onClick={() => openAddressModal(addr)} />,
                    <DeleteOutlined key="delete" style={{ color: 'red' }} onClick={() => handleDeleteAddress(addr.id)} />
                  ]}
                >
                  <Card.Meta
                    avatar={<HomeOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                    title={addr.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{addr.address_line}</Text>
                        <Text>{addr.city}, {addr.state} - {addr.pincode}</Text>
                        <Text type="secondary"><PhoneOutlined /> {addr.phone}</Text>
                      </Space>
                    }
                  />
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingAddress ? "Edit Address" : "Add New Address"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddressSubmit}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address_line" label="Address Line" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="state" label="State" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_default" valuePropName="checked" style={{ marginTop: 30 }}>
                <Checkbox>Set as default address</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block>
            {editingAddress ? "Update Address" : "Save Address"}
          </Button>
        </Form>
      </Modal>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>My Account</Title>
      <Card>
        <Tabs
          defaultActiveKey="profile"
          items={[
            { label: <span><UserOutlined />Profile Details</span>, key: 'profile', children: <ProfileTab /> },
            { label: <span><HomeOutlined />Addresses</span>, key: 'addresses', children: <AddressesTab /> },
          ]}
        />
      </Card>
    </div>
  );
};

export default Profile;