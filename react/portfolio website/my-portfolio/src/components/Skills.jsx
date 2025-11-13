import React from "react";

const Skills = () => {
  const frontend = ["React", "JavaScript (ES6+)", "HTML5", "CSS3", "Bootstrap"];
  const tools = ["Git", "Webpack / Vite", "ESLint", "npm", "Postman"];
  const other = ["Responsive Design", "REST APIs", "Accessibility", "Unit Testing"];

  const renderList = (arr) =>
    arr.map((s, i) => (
      <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
        {s}
        <span className="badge bg-primary rounded-pill">Intermediate</span>
      </li>
    ));

  return (
    <div className="skills-page">
      <h1 className="text-center mb-4">Skills</h1>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Frontend</h5>
              <ul className="list-group list-group-flush mt-3">{renderList(frontend)}</ul>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Tools & Workflow</h5>
              <ul className="list-group list-group-flush mt-3">{renderList(tools)}</ul>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Other</h5>
              <ul className="list-group list-group-flush mt-3">{renderList(other)}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
