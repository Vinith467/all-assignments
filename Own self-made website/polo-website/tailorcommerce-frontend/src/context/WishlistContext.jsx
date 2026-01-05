// src/context/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { message } from 'antd';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistCount(0);
      setWishlistIds(new Set());
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get('/wishlist/');
      if (response.data.success) {
        const items = response.data.wishlist;
        setWishlistCount(items.length);
        // Store IDs in a Set for fast lookup (is this item wishlisted?)
        setWishlistIds(new Set(items.map(item => item.product_id)));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      message.warning("Please login to use wishlist");
      return;
    }

    try {
      const response = await axiosInstance.post('/wishlist/toggle/', { product_id: productId });
      
      if (response.data.success) {
        if (response.data.action === 'added') {
          message.success("Added to wishlist");
          setWishlistIds(prev => new Set(prev).add(productId));
          setWishlistCount(prev => prev + 1);
        } else {
          message.success("Removed from wishlist");
          setWishlistIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          setWishlistCount(prev => prev - 1);
        }
      }
    } catch (error) {
      message.error("Failed to update wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistCount, wishlistIds, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};