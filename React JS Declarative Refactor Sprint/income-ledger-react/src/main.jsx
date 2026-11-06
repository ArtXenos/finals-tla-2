import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Midterm loaded Bootstrap from a CDN <link>; here it is installed with npm and imported
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
