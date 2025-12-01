import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/sidebar-theme.css";
import { initFaviconRotation } from "./utils/faviconRotation";

// Initialize hourly favicon rotation
initFaviconRotation();

createRoot(document.getElementById("root")!).render(<App />);
