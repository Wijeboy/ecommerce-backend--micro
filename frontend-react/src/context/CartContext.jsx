import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { request } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return null;
    }

    setLoading(true);
    try {
      const data = await request('/api/cart', { token });
      setCart(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const addToCart = useCallback(async (item) => {
    const data = await request('/api/cart/add', {
      method: 'POST',
      token,
      body: item,
    });
    setCart(data.cart);
    return data;
  }, [token]);

  const updateCartItem = useCallback(async (productId, quantity) => {
    const data = await request('/api/cart/update', {
      method: 'PUT',
      token,
      body: { productId, quantity },
    });
    setCart(data.cart);
    return data;
  }, [token]);

  const removeFromCart = useCallback(async (productId) => {
    const data = await request('/api/cart/remove', {
      method: 'DELETE',
      token,
      body: { productId },
    });
    setCart(data.cart);
    return data;
  }, [token]);

  const clearCart = useCallback(async () => {
    const data = await request('/api/cart/clear', {
      method: 'DELETE',
      token,
    });
    setCart(data.cart);
    return data;
  }, [token]);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount,
      refreshCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
    }),
    [cart, loading, itemCount, refreshCart, addToCart, updateCartItem, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
