export interface Keybinding {
  readonly code: string; // Physical key code (e.g. "Digit1", "KeyP")
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly shiftKey?: boolean;
  readonly metaKey?: boolean;
}

export interface KeybindingMap {
  readonly focusTodo: Keybinding;
  readonly focusEditor: Keybinding;
  readonly togglePreview: Keybinding;
}

export const defaultKeybindings: KeybindingMap = {
  focusTodo: { code: "Digit1", altKey: true },
  focusEditor: { code: "Digit2", altKey: true },
  togglePreview: { code: "KeyP", altKey: true },
};

const KEYBINDINGS_KEY = "tabdraft_keybindings";

function getStorage(): chrome.storage.SyncStorageArea | null {
  if (typeof chrome !== "undefined" && chrome.storage?.sync) {
    return chrome.storage.sync;
  }
  return null;
}

export async function loadKeybindings(): Promise<KeybindingMap> {
  const storage = getStorage();
  if (storage) {
    const result = await storage.get(KEYBINDINGS_KEY);
    return (result[KEYBINDINGS_KEY] as KeybindingMap | undefined) ?? defaultKeybindings;
  }
  const raw = localStorage.getItem(KEYBINDINGS_KEY);
  return raw ? JSON.parse(raw) : defaultKeybindings;
}

export async function saveKeybindings(bindings: KeybindingMap): Promise<void> {
  const storage = getStorage();
  if (storage) {
    await storage.set({ [KEYBINDINGS_KEY]: bindings });
    return;
  }
  localStorage.setItem(KEYBINDINGS_KEY, JSON.stringify(bindings));
}

export function matchesKeybinding(e: KeyboardEvent, binding: Keybinding): boolean {
  return (
    e.code === binding.code &&
    !!e.altKey === !!binding.altKey &&
    !!e.ctrlKey === !!binding.ctrlKey &&
    !!e.shiftKey === !!binding.shiftKey &&
    !!e.metaKey === !!binding.metaKey
  );
}

/** Convert a code like "Digit1" or "KeyP" to a display label */
function codeToLabel(code: string): string {
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Key")) return code.slice(3);
  // Special keys
  const map: Record<string, string> = {
    Backquote: "`", Minus: "-", Equal: "=",
    BracketLeft: "[", BracketRight: "]", Backslash: "\\",
    Semicolon: ";", Quote: "'", Comma: ",", Period: ".",
    Slash: "/", Space: "Space", Enter: "Enter", Escape: "Esc",
    ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
    Backspace: "Backspace", Delete: "Delete", Tab: "Tab",
  };
  return map[code] ?? code;
}

export function formatKeybinding(binding: Keybinding): string {
  const parts: string[] = [];
  if (binding.ctrlKey) parts.push("\u2303");  // ⌃
  if (binding.altKey) parts.push("\u2325");    // ⌥
  if (binding.shiftKey) parts.push("\u21e7");  // ⇧
  if (binding.metaKey) parts.push("\u2318");   // ⌘
  parts.push(codeToLabel(binding.code));
  return parts.join("");
}

export function captureKeybinding(e: KeyboardEvent): Keybinding | null {
  // Ignore bare modifier keys
  if (["Alt", "Control", "Shift", "Meta"].includes(e.key)) return null;
  // Require at least one modifier
  if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) return null;

  return {
    code: e.code,
    ...(e.altKey && { altKey: true }),
    ...(e.ctrlKey && { ctrlKey: true }),
    ...(e.shiftKey && { shiftKey: true }),
    ...(e.metaKey && { metaKey: true }),
  };
}
