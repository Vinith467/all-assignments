import { useTheme } from "../context/ThemeContext";

function Home() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme === "light" ? "#fff" : "#121212",
        color: theme === "light" ? "#000" : "#fff",
        transition: "all 0.3s ease",
      }}
    >
      <h1>{theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}</h1>
    </div>
  );
}

export default Home;
