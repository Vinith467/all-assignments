// src/pages/Login.jsx - COMPLETE UPDATE

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Typography,
  ConfigProvider,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginBg from "../assets/login-bg.jpg";


const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (values) => {
    setLoading(true);
    const result = await login(values.username, values.password);
    setLoading(false);

    if (result.success) {
      // Redirect based on role
      if (result.user.role === "ADMIN" || result.user.role === "STAFF") {
        navigate("/admin", { replace: true });
      } else {
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      }
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    const result = await register(
      values.username,
      values.email,
      values.password,
      values.phone
    );
    setLoading(false);

    if (result.success) {
      // New registrations always go to home
      navigate("/", { replace: true });
    }
  };

  const loginForm = (
    <Form name="login" onFinish={handleLogin} size="large" layout="vertical">
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Please enter your username" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          style={{
            backgroundColor: "#ecb708ff",
            borderColor: "#ecb708ff",
            color: "#000",
            fontWeight: 600,
          }}
        >
          Log In
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form
      name="register"
      onFinish={handleRegister}
      size="large"
      layout="vertical"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: "Please enter username" },
          { min: 3, message: "Username must be at least 3 characters" },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Please enter email" },
          { type: "email", message: "Please enter valid email" },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="phone"
        rules={[
          { required: true, message: "Please enter phone number" },
          {
            pattern: /^[0-9]{10}$/,
            message: "Please enter valid 10-digit phone number",
          },
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="Phone (10 digits)"
          maxLength={10}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: "Please enter password" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match"));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm Password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          style={{
            backgroundColor: "#ecb708ff",
            borderColor: "#ecb708ff",
            color: "#000",
            fontWeight: 600,
          }}
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        
        backgroundImage: `
      url(${loginBg})
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backdropFilter: "blur(2px)",
      }}
    >
      <Card
       bordered={false}
        style={{
          width: "100%",
          maxWidth: 450,
          background: "linear-gradient(135deg, #001529, #4096ff)",
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", textAlign: "center" }}
        >
          <div>
            <Title level={2} style={{ margin: 0, color: "white" }}>
              Polo Fashions
            </Title>
            <Text type="secondary" style={{ margin: 0, color: "#ecb708ff" }}>
              Your Premium Tailoring Partner
            </Text>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Tabs: {
                  itemColor: "white",
                  itemSelectedColor: "#ecb708ff",
                  inkBarColor: "#ecb708ff",
                },
              },
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              items={[
                {
                  key: "login",
                  label: "Login",
                  children: loginForm,
                },
                {
                  key: "register",
                  label: "Register",
                  children: registerForm,
                },
              ]}
            />
          </ConfigProvider>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
