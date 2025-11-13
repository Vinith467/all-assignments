import React from "react";
import { useCart } from "../context/CartContext";

const products = [
  { id: 1, name: "Laptop", price: 800 },
  { id: 2, name: "Headphones", price: 150 },
  { id: 3, name: "Keyboard", price: 100 },
];

function ProductList() {
  const { dispatch } = useCart();

  const addToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  return (
    <div>
      <h2>🛍 Product List</h2>
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px",
            width: "250px",
          }}
        >
          <h4>{p.name}</h4>
          <p>💰 ${p.price}</p>
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
