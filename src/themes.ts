export interface ThemeVars {
  readonly bg: string;
  readonly surface: string;
  readonly surfaceHover: string;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly accentHover: string;
  readonly danger: string;
  readonly border: string;
  readonly todoDone: string;
  readonly cmSelection: string;
  readonly cmCode: string;
  readonly cmFontSize: string;
  readonly cmLineHeight: string;
  readonly cmH1Size: string;
  readonly cmH2Size: string;
  readonly cmH3Size: string;
  readonly cmH4Size: string;
  readonly cmH5Size: string;
  readonly cmH6Size: string;
  readonly cmHeadingWeight: string;
  readonly cmHeadingColor: string;
  readonly cmContentMaxWidth: string;
}

const varMap: Record<keyof ThemeVars, string> = {
  bg: "--bg",
  surface: "--surface",
  surfaceHover: "--surface-hover",
  text: "--text",
  textMuted: "--text-muted",
  accent: "--accent",
  accentHover: "--accent-hover",
  danger: "--danger",
  border: "--border",
  todoDone: "--todo-done",
  cmSelection: "--cm-selection",
  cmCode: "--cm-code",
  cmFontSize: "--cm-font-size",
  cmLineHeight: "--cm-line-height",
  cmH1Size: "--cm-h1-size",
  cmH2Size: "--cm-h2-size",
  cmH3Size: "--cm-h3-size",
  cmH4Size: "--cm-h4-size",
  cmH5Size: "--cm-h5-size",
  cmH6Size: "--cm-h6-size",
  cmHeadingWeight: "--cm-heading-weight",
  cmHeadingColor: "--cm-heading-color",
  cmContentMaxWidth: "--cm-content-max-width",
};

const editorDefaults: Pick<ThemeVars,
  "cmFontSize" | "cmLineHeight" | "cmH1Size" | "cmH2Size" | "cmH3Size" | "cmH4Size" | "cmH5Size" | "cmH6Size" | "cmHeadingWeight" | "cmHeadingColor" | "cmContentMaxWidth"
> = {
  cmFontSize: "14px",
  cmLineHeight: "1.7",
  cmH1Size: "1.6em",
  cmH2Size: "1.4em",
  cmH3Size: "1.2em",
  cmH4Size: "1.1em",
  cmH5Size: "1.05em",
  cmH6Size: "1em",
  cmHeadingWeight: "bold",
  cmHeadingColor: "var(--accent)",
  cmContentMaxWidth: "none",
};

export const themes: Record<"dark" | "light" | "monokai", ThemeVars> = {
  dark: {
    bg: "#1e1e2e",
    surface: "#282840",
    surfaceHover: "#313150",
    text: "#cdd6f4",
    textMuted: "#6c7086",
    accent: "#89b4fa",
    accentHover: "#74c7ec",
    danger: "#f38ba8",
    border: "#45475a",
    todoDone: "#a6adc8",
    cmSelection: "rgba(56, 139, 253, 0.3)",
    cmCode: "#fab387",
    ...editorDefaults,
  },
  light: {
    bg: "#ffffff",
    surface: "#f5f5f5",
    surfaceHover: "#e8e8e8",
    text: "#1e1e1e",
    textMuted: "#6b7280",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    danger: "#dc2626",
    border: "#d1d5db",
    todoDone: "#9ca3af",
    cmSelection: "rgba(37, 99, 235, 0.2)",
    cmCode: "#b45309",
    ...editorDefaults,
  },
  monokai: {
    bg: "#272822",
    surface: "#3e3d32",
    surfaceHover: "#49483e",
    text: "#f8f8f2",
    textMuted: "#75715e",
    accent: "#a6e22e",
    accentHover: "#b6f23e",
    danger: "#f92672",
    border: "#49483e",
    todoDone: "#75715e",
    cmSelection: "rgba(166, 226, 46, 0.2)",
    cmCode: "#e6db74",
    ...editorDefaults,
  },
};

function themeToCSS(selector: string, vars: ThemeVars): string {
  const lines = Object.entries(varMap).map(
    ([key, cssVar]) => `  ${cssVar}: ${vars[key as keyof ThemeVars]};`
  );
  return `${selector} {\n${lines.join("\n")}\n}`;
}

export function generateBuiltinCSS(): string {
  return [
    themeToCSS(":root, [data-theme=\"dark\"]", themes.dark),
    themeToCSS("[data-theme=\"light\"]", themes.light),
    themeToCSS("[data-theme=\"monokai\"]", themes.monokai),
  ].join("\n\n");
}

export function generateCustomTemplate(): string {
  return themeToCSS(":root[data-theme=\"custom\"]", themes.dark);
}
