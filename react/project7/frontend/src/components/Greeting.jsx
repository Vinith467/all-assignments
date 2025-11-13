// src/components/Greeting.jsx
import React from "react";

const Greeting = () => {
  const currentHour = new Date().getHours(); // get the current hour (0–23)
  let greeting = "";

  if (currentHour < 12) {
    greeting = "Good Morning 🌅";
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good Afternoon ☀️";
  } else {
    greeting = "Good Evening 🌙";
  }

  const greetingStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    marginTop: "50px",
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={greetingStyle}>{greeting}</h1>
      <p style={{ color: "#666" }}>
        Current Hour: {currentHour}:00
      </p>
    </div>
  );
};

export default Greeting;
