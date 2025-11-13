import React from "react";
import { CartProvider } from "./context/CartContext";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

function App() {
  return (
    <CartProvider>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <ProductList />
        <Cart />
      </div>
    </CartProvider>
  );
}

export default App;
