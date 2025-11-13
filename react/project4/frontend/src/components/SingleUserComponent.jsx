// src/components/SingleUserComponent.jsx
import React from "react";

function SingleUserComponent({ user, onDelete }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.phone}</td>
      <td>{user.address}</td>
      <td>
        <button
          onClick={() => onDelete(user.id)}
          style={{ background: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px" }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default SingleUserComponent;
