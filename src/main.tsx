import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Sekampfire: missing #root mount element");
createRoot(root).render(<App />);
