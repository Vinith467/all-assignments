import React from "react";

const Projects = () => {
  return (
    <div>
      <h1 className="text-center mb-4">My Projects</h1>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Project 1</h5>
              <p className="card-text">A React app demonstrating context and routing.</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Project 2</h5>
              <p className="card-text">A responsive portfolio built with Bootstrap.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
