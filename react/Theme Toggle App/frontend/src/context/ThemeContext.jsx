import { createContext, useState, useContext } from "react";

// Create context
const ThemeContext = createContext();

// Custom hook for easy access
export const useTheme = () => useContext(ThemeContext);

// Theme Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // Default is light mode

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
