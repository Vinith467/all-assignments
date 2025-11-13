import React, { useState } from "react";

function TaskList() {
  const [tasks, setTasks] = useState([
    {
      name: "Task 1",
      status: "done",
    },
    {
      name: "Task 2",
      status: "not done",
    },
    {
      name: "Task 3",
      status: "done",
    },
  ]);

  const toggleStatus = (index) => {
    const updatedTasks = tasks.map((task, i) => {
      if (i === index) {
        return {
          ...task,
          status: task.status === "done" ? "not done" : "done",
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };
  return (
    <div style={{ padding: "20px" }}>
      <h2>Employee Task List</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {tasks.map((task, index) => (
          <li key={index} style={{ margin: "10px 0" }}>
            <strong>{task.name}</strong> — Status:{" "}
            <span
              style={{
                color: task.status === "done" ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {task.status}
            </span>
            <button
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
              onClick={() => toggleStatus(index)}
            >
              Toggle Status
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList