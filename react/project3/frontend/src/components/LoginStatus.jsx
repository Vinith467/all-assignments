import React, { useState } from "react";

function LoginStatus() {
  // Step 1: create a boolean state variable
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Step 2: function to toggle login status
  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn); // flip true <-> false
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login Status Example</h2>

      {/* Step 3: short-circuit rendering */}
      {isLoggedIn && <p style={{ color: "green" }}>You are logged in ✅</p>}

      {/* Step 4: button to toggle login state */}
      <button
        onClick={toggleLogin}
        style={{ padding: "8px 16px", cursor: "pointer", marginTop: "10px" }}
      >
        {isLoggedIn ? "Logout" : "Login"}
      </button>
    </div>
  );
}

export default LoginStatus;
