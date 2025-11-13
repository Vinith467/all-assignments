// src/components/AllUsersComponent.jsx
import React, { useState } from "react";
import SingleUserComponent from "./SingleUserComponent";
import { users as usersData } from "../data/users";

function AllUsersComponent() {
  const [userList, setUserList] = useState([]); // initially empty
  const [isAdded, setIsAdded] = useState(false); // track if users added

  const handleAddUsers = () => {
    if (isAdded) {
      // if users already added, delete all
      setUserList([]);
      setIsAdded(false);
    } else {
      // add all users
      setUserList(usersData);
      setIsAdded(true);
    }
  };

  const handleDeleteUser = (id) => {
    const updatedList = userList.filter((user) => user.id !== id);
    setUserList(updatedList);

    // if all users deleted, toggle back button
    if (updatedList.length === 0) {
      setIsAdded(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <button
        onClick={handleAddUsers}
        style={{
          background: isAdded ? "red" : "green",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        {isAdded ? "Delete All Users" : "Add All Users"}
      </button>

      {userList.length > 0 && (
        <table border="1" cellPadding="10" style={{ margin: "auto" }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <SingleUserComponent key={user.id} user={user} onDelete={handleDeleteUser} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllUsersComponent;
