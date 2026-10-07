import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./api/dbFallback.js";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./theme/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>,
);
