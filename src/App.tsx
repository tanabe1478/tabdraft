import { useState, useEffect, useCallback, useRef } from "react";
import { TodoPanel, type TodoPanelHandle } from "./components/TodoPanel";
import { MarkdownPanel, type MarkdownPanelHandle } from "./components/MarkdownPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { loadData, debouncedSave, type AppData } from "./storage";
import { addTodo, toggleTodo, removeTodo } from "./todo";
import {
  type KeybindingMap,
  type Settings,
  loadKeybindings,
  saveKeybindings,
  loadSettings,
  saveSettings,
  matchesKeybinding,
} from "./keybindings";
import { applyTheme, watchSystemTheme } from "./theme";

export function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [keybindings, setKeybindings] = useState<KeybindingMap | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const todoRef = useRef<TodoPanelHandle>(null);
  const markdownRef = useRef<MarkdownPanelHandle>(null);

  useEffect(() => {
    loadData().then(setData);
    loadKeybindings().then(setKeybindings);
    loadSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!keybindings) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (settingsOpen) return;
      if (matchesKeybinding(e, keybindings!.focusTodo)) {
        e.preventDefault();
        e.stopPropagation();
        todoRef.current?.focus();
      } else if (matchesKeybinding(e, keybindings!.focusEditor)) {
        e.preventDefault();
        e.stopPropagation();
        markdownRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [keybindings, settingsOpen]);

  const save = useCallback((next: AppData) => {
    setData(next);
    debouncedSave(next);
  }, []);

  const handleAddTodo = useCallback(
    (text: string) => {
      if (!data) return;
      const newTodos = addTodo(data.todos, text);
      if (newTodos !== data.todos) {
        save({ ...data, todos: newTodos });
      }
    },
    [data, save]
  );

  const handleToggleTodo = useCallback(
    (id: string) => {
      if (!data) return;
      save({ ...data, todos: toggleTodo(data.todos, id) });
    },
    [data, save]
  );

  const handleRemoveTodo = useCallback(
    (id: string) => {
      if (!data) return;
      save({ ...data, todos: removeTodo(data.todos, id) });
    },
    [data, save]
  );

  const handleMarkdownChange = useCallback(
    (markdown: string) => {
      if (!data) return;
      save({ ...data, markdown });
    },
    [data, save]
  );

  const focusMarkdown = useCallback(() => {
    markdownRef.current?.focus();
  }, []);

  const handleSaveSettings = useCallback((nextKeybindings: KeybindingMap, nextSettings: Settings) => {
    setKeybindings(nextKeybindings);
    saveKeybindings(nextKeybindings);
    setSettings(nextSettings);
    saveSettings(nextSettings);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    applyTheme(settings.theme, settings.customCSS);
    // Clear inline overrides so custom CSS has full control
    const inlineProps = [
      "--cm-content-max-width", "--cm-font-size", "--cm-heading-weight",
      ...Array.from({ length: 6 }, (_, i) => `--cm-h${i + 1}-size`),
    ];
    for (const prop of inlineProps) {
      root.style.removeProperty(prop);
    }
    if (settings.theme !== "custom") {
      root.style.setProperty("--cm-content-max-width", settings.textAlign === "center" ? "700px" : "none");
      root.style.setProperty("--cm-font-size", `${settings.fontSize}px`);
      if (settings.headingSize === "normal") {
        for (let i = 1; i <= 6; i++) {
          root.style.setProperty(`--cm-h${i}-size`, "1em");
        }
        root.style.setProperty("--cm-heading-weight", "normal");
      }
    }
    return watchSystemTheme(settings.theme, () => applyTheme(settings.theme, settings.customCSS));
  }, [settings?.theme, settings?.customCSS, settings?.textAlign, settings?.fontSize, settings?.headingSize]);

  // Auto-focus editor on mount (after window.open bypasses omnibox focus)
  useEffect(() => {
    if (data && keybindings && settings) {
      requestAnimationFrame(() => {
        markdownRef.current?.focus();
      });
    }
  }, [data !== null && keybindings !== null && settings !== null]);

  if (!data || !keybindings || !settings) return null;

  return (
    <div id="app">
      <button
        className="btn-settings-float"
        onClick={() => setSettingsOpen(true)}
        title="Settings"
      >
        &#9881;
      </button>
      <main className="main">
        {settings.showTodo && (
          <TodoPanel
            ref={todoRef}
            todos={data.todos}
            onAdd={handleAddTodo}
            onToggle={handleToggleTodo}
            onRemove={handleRemoveTodo}
            onEscape={focusMarkdown}
          />
        )}
        <MarkdownPanel
          ref={markdownRef}
          value={data.markdown}
          onChange={handleMarkdownChange}
        />
      </main>
      <SettingsDialog
        open={settingsOpen}
        keybindings={keybindings}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
