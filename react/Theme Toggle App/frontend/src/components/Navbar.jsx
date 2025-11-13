import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      style={{
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: theme === "light" ? "#f0f0f0" : "#333",
        color: theme === "light" ? "#000" : "#fff",
      }}
    >
      <h2>Theme Toggle App</h2>
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </nav>
  );
}

export default Navbar;
