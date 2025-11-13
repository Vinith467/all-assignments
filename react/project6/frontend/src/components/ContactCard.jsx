// src/components/ContactCard.jsx
import React from "react";

const ContactCard = ({ name, email, phone, address }) => {
  return (
    <div
      style={{
        border: "1px solid #066366ff",
        borderRadius: "10px",
        padding: "15px",
        margin: "10px",
        width: "250px",
        backgroundColor: "#c62d2dff",
        boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3>{name}</h3>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Phone:</strong> {phone}
      </p>
      <p>
        <strong>Address:</strong> {address}
      </p>
    </div>
  );
};

export default ContactCard;
