import { useState, useEffect, useCallback, useRef } from "react";
import { TodoPanel, type TodoPanelHandle } from "./components/TodoPanel";
import { MarkdownPanel, type MarkdownPanelHandle } from "./components/MarkdownPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { loadData, debouncedSave, type AppData } from "./storage";
import { addTodo, toggleTodo, removeTodo } from "./todo";
import {
  type KeybindingMap,
  loadKeybindings,
  saveKeybindings,
  matchesKeybinding,
  formatKeybinding,
} from "./keybindings";

export function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [keybindings, setKeybindings] = useState<KeybindingMap | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const todoRef = useRef<TodoPanelHandle>(null);
  const markdownRef = useRef<MarkdownPanelHandle>(null);

  useEffect(() => {
    loadData().then(setData);
    loadKeybindings().then(setKeybindings);
  }, []);

  // Global keyboard shortcuts (capture phase to intercept before textarea-markdown-editor)
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
      } else if (matchesKeybinding(e, keybindings!.togglePreview)) {
        e.preventDefault();
        e.stopPropagation();
        markdownRef.current?.togglePreview();
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

  const handleSaveKeybindings = useCallback((next: KeybindingMap) => {
    setKeybindings(next);
    saveKeybindings(next);
  }, []);

  // Auto-focus editor on mount (after window.open bypasses omnibox focus)
  useEffect(() => {
    if (data && keybindings) {
      requestAnimationFrame(() => {
        markdownRef.current?.focus();
      });
    }
  }, [data !== null && keybindings !== null]);

  if (!data || !keybindings) return null;

  return (
    <div id="app">
      <header className="header">
        <h1 className="header-title">TabDraft</h1>
        <span className="header-shortcuts">
          {formatKeybinding(keybindings.focusTodo)}: TODO
          {" \u00b7 "}
          {formatKeybinding(keybindings.focusEditor)}: Editor
          {" \u00b7 "}
          {formatKeybinding(keybindings.togglePreview)}: Preview
        </span>
        <button
          className="btn btn-settings"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          &#9881;
        </button>
      </header>
      <main className="main">
        <TodoPanel
          ref={todoRef}
          todos={data.todos}
          onAdd={handleAddTodo}
          onToggle={handleToggleTodo}
          onRemove={handleRemoveTodo}
          onEscape={focusMarkdown}
        />
        <MarkdownPanel
          ref={markdownRef}
          value={data.markdown}
          onChange={handleMarkdownChange}
        />
      </main>
      <SettingsDialog
        open={settingsOpen}
        keybindings={keybindings}
        onSave={handleSaveKeybindings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
