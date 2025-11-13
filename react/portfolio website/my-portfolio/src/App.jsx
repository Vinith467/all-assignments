import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const About = React.lazy(() => import("./components/About"));
const Projects = React.lazy(() => import("./components/Projects"));
const Skills = React.lazy(() => import("./components/Skills"));
const Resume = React.lazy(() => import("./components/Resume"));
const Contact = React.lazy(() => import("./components/Contact"));

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<p className="text-center mt-5">Loading...</p>}>
        <div className="container my-4">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
