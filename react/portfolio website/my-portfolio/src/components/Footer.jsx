import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-5">
      <p className="mb-0">&copy; {new Date().getFullYear()} My Portfolio | All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
