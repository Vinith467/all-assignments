import React from "react";

const Resume = () => {
  // put your resume file in public/resume.pdf or src/assets/resume.pdf
  // If using public folder, use: /resume.pdf
  // If using src/assets, import it (requires bundler handling)
  const resumeUrl = "/resume.pdf"; // place resume.pdf into your project's public/ folder

  return (
    <div className="resume-page text-center">
      <h1 className="mb-4">Resume</h1>

      <div className="card mx-auto" style={{ maxWidth: 800 }}>
        <div className="card-body text-start">
          <h4>Vinith S Shetty (replace with your name)</h4>
          <p className="text-muted">Full Stack Developer — React • JavaScript • UI/UX</p>

          <hr />

          <section>
            <h6>Summary</h6>
            <p>
              Passionate developer experienced in building responsive web apps with React, focusing on
              performance and maintainable code. Strong foundation in JavaScript, component architecture,
              and modern frontend tooling.
            </p>
          </section>

          <section className="mt-3">
            <h6>Experience</h6>
            <ul>
              <li><strong>Frontend Developer</strong> — XYZ Company (2023 - Present)</li>
              <li><strong>Intern</strong> — ABC Labs (2022)</li>
            </ul>
          </section>

          <section className="mt-3">
            <h6>Education</h6>
            <p>Bachelor of Engineering — Example University</p>
          </section>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <a href={resumeUrl} className="btn btn-primary" download>
              ⬇️ Download Resume (PDF)
            </a>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
              View Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
