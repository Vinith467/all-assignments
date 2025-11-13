import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  return (
    <nav
      style={{
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme === "light" ? "#f4f4f4" : "#222",
        color: theme === "light" ? "#000" : "#fff",
      }}
    >
      <h2>Multi Theme App</h2>
      <div>
        <button onClick={setLightTheme} style={{ marginRight: "10px" }}>
          ☀️ Light
        </button>
        <button onClick={setDarkTheme}>🌙 Dark</button>
      </div>
    </nav>
  );
}

export default Navbar;
