import Navbar from "./components/Navbar";
import Home from "./components/Home";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <Home />
    </ThemeProvider>
  );
}

export default App;
