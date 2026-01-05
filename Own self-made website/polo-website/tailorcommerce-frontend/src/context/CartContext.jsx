// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCartCount = async () => {
    try {
      const response = await axiosInstance.get('/cart/');
      if (response.data.success) {
        setCartCount(response.data.cart.items_count);
      }
    } catch (error) {
      // Silently fail
      setCartCount(0);
    }
  };

  const refreshCart = async () => {
    setLoading(true);
    await fetchCartCount();
    setLoading(false);
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};