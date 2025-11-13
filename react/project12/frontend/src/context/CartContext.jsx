import React, { createContext, useReducer, useContext } from "react";

// Create the Context
const CartContext = createContext();

// Initial cart state
const initialState = {
  cartItems: [],
};

// Reducer function to handle cart actions
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      // Check if item already exists
      const existingItem = state.cartItems.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        // If item exists, increase quantity
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      // Add new item
      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.id !== action.payload.id
        ),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    default:
      return state;
  }
}

// Provider component to wrap app
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for using context easily
export const useCart = () => useContext(CartContext);
