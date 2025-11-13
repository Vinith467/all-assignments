import React from "react";
import { personsData } from "../data/personsData";

/**
 * calculateAge
 * - dobString: string in format "YYYY-MM-DD"
 * - returns age in completed years (integer)
 */
function calculateAge(dobString) {
  if (!dobString) return null;

  const dob = new Date(dobString); // parse the input string
  if (Number.isNaN(dob.getTime())) return null; // invalid date guard

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  // Check if the birthday this year has already happened.
  const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (today < thisYearBirthday) {
    age -= 1; // birthday not yet reached this year
  }

  return age;
}

function formatDate(dobString) {
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return dobString;
  // Format nicely, e.g., "Jan 15, 1990" (depends on user locale)
  return dob.toLocaleDateString();
}

export default function PersonDetails() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Person Details</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {personsData.map((person, index) => {
          const age = calculateAge(person.dateOfBirth);
          return (
            <li key={index} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{person.name}</div>
              <div>Date of Birth: {formatDate(person.dateOfBirth)}</div>
              <div>
                Age:{" "}
                {age === null
                  ? "Invalid date"
                  : `${age} ${age === 1 ? "year" : "years"}`}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
