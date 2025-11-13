import React from "react";
import { useCart } from "../context/CartContext";

function Cart() {
  const { state, dispatch } = useCart();

  const removeItem = (item) => {
    dispatch({ type: "REMOVE_ITEM", payload: item });
  };

  const updateQuantity = (item, quantity) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: item.id, quantity: parseInt(quantity) },
    });
  };

  return (
    <div>
      <h2>🛒 Your Cart</h2>
      {state.cartItems.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        state.cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              borderBottom: "1px solid gray",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <h4>{item.name}</h4>
            <p>Price: ${item.price}</p>
            <label>
              Quantity:
              <input
                type="number"
                value={item.quantity}
                min="1"
                onChange={(e) => updateQuantity(item, e.target.value)}
              />
            </label>
            <button onClick={() => removeItem(item)}>Remove</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Cart;
