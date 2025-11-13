import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the Home Page</h1>
      <p>Navigate to other pages below:</p>
      <Link to="/login">Go to Login</Link> | <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
};

export default Home;
