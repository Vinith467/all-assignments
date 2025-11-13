import { createContext, useState, useContext } from "react";

// Create context
const ThemeContext = createContext();

// Custom hook
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // default: light theme

  const setLightTheme = () => setTheme("light");
  const setDarkTheme = () => setTheme("dark");

  return (
    <ThemeContext.Provider value={{ theme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
