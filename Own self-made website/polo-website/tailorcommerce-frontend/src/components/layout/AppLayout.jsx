// src/components/layout/AppLayout.jsx
import { Layout, Menu, Badge, Button, Drawer, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  HomeOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MenuOutlined,
  LogoutOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from '../../context/WishlistContext';

const { Header, Content, Footer } = Layout;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: "Home", path: "/" },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Products",
      path: "/products",
    },
    {
      key: "bookings",
      icon: <CalendarOutlined />,
      label: "Bookings",
      path: "/bookings",
    },
    {
      key: "orders",
      icon: <FileTextOutlined />,
      label: "My Orders",
      path: "/orders",
    },
  ];
  // User menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((i) => i.key === key);
    if (item) {
      navigate(item.path);
      setMobileMenuOpen(false);
    }
  };

  const getCurrentKey = () => {
    const item = menuItems.find((i) => i.path === location.pathname);
    return item ? item.key : "home";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#001529",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div
          style={{
            color: "white",
            fontSize: "clamp(16px, 4vw, 20px)",
            fontWeight: "bold",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={() => navigate("/")}
        >
          Polo Fashions
        </div>

        {/* Desktop Menu */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getCurrentKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: 50,
            display: window.innerWidth < 768 ? "none" : "flex",
          }}
        />

        {/* Right Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge count={cartCount} showZero>
            <Button
              type="text"
              icon={
                <ShoppingCartOutlined
                  style={{ fontSize: 20, color: "white" }}
                />
              }
              onClick={() => navigate("/cart")}
            />
          </Badge>
          <Badge count={wishlistCount}showZero color="#eb2f96">
            <Button
              type="text"
              icon={<HeartOutlined style={{ fontSize: 20, color: "white" }} />}
              onClick={() => navigate("/wishlist")}
            />
    ``      </Badge>

          {/* User Dropdown - UPDATED */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button
              type="text"
              icon={<UserOutlined style={{ fontSize: 20, color: "white" }} />}
            />
          </Dropdown>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20, color: "white" }} />}
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: window.innerWidth >= 768 ? "none" : "block" }}
          />
        </div>
      </Header>
      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <Menu
          mode="vertical"
          selectedKeys={[getCurrentKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: "none" }}
        />
      </Drawer>

      <Content
        style={{
          padding: "clamp(16px, 3vw, 24px) clamp(16px, 5vw, 50px)",
          background: "#f0f2f5",
          minHeight: "calc(100vh - 128px)",
        }}
      >
        {children}
      </Content>

      <Footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          fontSize: "clamp(12px, 2.5vw, 14px)",
        }}
      >
        Polo Fashions ©2026 - Professional Tailoring Services
      </Footer>
    </Layout>
  );
};

export default AppLayout;
