// src/App.jsx
import React from "react";
import ContactCard from "./components/ContactCard";

const contacts = [
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "555-1234",
    address: "123 Maple Street, Springfield",
  },
  {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    phone: "555-5678",
    address: "456 Oak Avenue, Metropolis",
  },
  {
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "555-8765",
    address: "789 Pine Road, Gotham",
  },
];

function App() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Contact List</h1>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {contacts.map((person, index) => (
          <ContactCard
            key={index}
            name={person.name}
            email={person.email}
            phone={person.phone}
            address={person.address}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
