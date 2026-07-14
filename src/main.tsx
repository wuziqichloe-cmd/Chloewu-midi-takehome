import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Order matters: tokens declare the variables everything downstream consumes.
import "./styles/tokens.css";
import "./styles/reset.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
