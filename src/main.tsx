import { createRoot } from "react-dom/client";
import { App } from "./App";
import { generateBuiltinCSS } from "./themes";

// Inject built-in theme CSS variables (single source of truth: themes.ts)
const style = document.createElement("style");
style.id = "tabdraft-builtin-themes";
style.textContent = generateBuiltinCSS();
document.head.appendChild(style);

const root = document.getElementById("root")!;
createRoot(root).render(<App />);
