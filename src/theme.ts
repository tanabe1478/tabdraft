import type { Theme } from "./keybindings";
import { generateCustomTemplate } from "./themes";

const CUSTOM_STYLE_ID = "tabdraft-custom-theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme, customCSS?: string): void {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", resolved);

  let styleEl = document.getElementById(CUSTOM_STYLE_ID);
  if (theme === "custom") {
    const css = customCSS || generateCustomTemplate();
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = CUSTOM_STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  } else if (styleEl) {
    styleEl.remove();
  }
}

export function watchSystemTheme(theme: Theme, callback: () => void): (() => void) | undefined {
  if (theme !== "system") return undefined;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => callback();
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
