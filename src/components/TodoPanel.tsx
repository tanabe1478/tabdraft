import { useState, useCallback, useRef, useImperativeHandle, forwardRef, type KeyboardEvent } from "react";
import type { TodoItem } from "../storage";
import { t } from "../i18n";

interface TodoPanelProps {
  readonly todos: readonly TodoItem[];
  readonly onAdd: (text: string) => void;
  readonly onToggle: (id: string) => void;
  readonly onRemove: (id: string) => void;
  readonly onEscape?: () => void;
}

export interface TodoPanelHandle {
  focus: () => void;
}

export const TodoPanel = forwardRef<TodoPanelHandle, TodoPanelProps>(
  function TodoPanel({ todos, onAdd, onToggle, onRemove, onEscape }, handle) {
    const [input, setInput] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useImperativeHandle(handle, () => ({
      focus() {
        inputRef.current?.focus();
      },
    }));

    const handleAdd = useCallback(() => {
      if (input.trim() === "") return;
      onAdd(input);
      setInput("");
    }, [input, onAdd]);

    const handleInputKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          handleAdd();
        } else if (e.key === "Escape") {
          onEscape?.();
        } else if (e.key === "ArrowDown" && e.metaKey && todos.length > 0) {
          e.preventDefault();
          setFocusedIndex(0);
          const firstItem = listRef.current?.querySelector<HTMLElement>(".todo-item");
          firstItem?.focus();
        }
      },
      [handleAdd, onEscape, todos.length]
    );

    const handleItemKeyDown = useCallback(
      (e: KeyboardEvent<HTMLLIElement>, index: number, todo: TodoItem) => {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            if (index < todos.length - 1) {
              setFocusedIndex(index + 1);
              const items = listRef.current?.querySelectorAll<HTMLElement>(".todo-item");
              items?.[index + 1]?.focus();
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            if (index > 0) {
              setFocusedIndex(index - 1);
              const items = listRef.current?.querySelectorAll<HTMLElement>(".todo-item");
              items?.[index - 1]?.focus();
            } else {
              setFocusedIndex(-1);
              inputRef.current?.focus();
            }
            break;
          case " ":
          case "Enter":
            e.preventDefault();
            onToggle(todo.id);
            break;
          case "Delete":
          case "Backspace":
            e.preventDefault();
            onRemove(todo.id);
            if (index > 0) {
              setFocusedIndex(index - 1);
              setTimeout(() => {
                const items = listRef.current?.querySelectorAll<HTMLElement>(".todo-item");
                items?.[index - 1]?.focus();
              }, 0);
            } else {
              setFocusedIndex(-1);
              inputRef.current?.focus();
            }
            break;
          case "Escape":
            onEscape?.();
            break;
        }
      },
      [todos, onToggle, onRemove, onEscape]
    );

    return (
      <section className="panel todo-panel">
        <h2 className="panel-title">
          {t("todo")}
        </h2>
        <div className="todo-input-row">
          <textarea
            ref={inputRef}
            className="todo-input"
            placeholder={t("addPlaceholder")}
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button className="btn btn-add" onClick={handleAdd}>
            +
          </button>
        </div>
        <ul ref={listRef} className="todo-list">
          {todos.map((todo, index) => (
            <li
              key={todo.id}
              className={`todo-item${todo.done ? " done" : ""}${focusedIndex === index ? " focused" : ""}`}
              tabIndex={0}
              onKeyDown={(e) => handleItemKeyDown(e, index, todo)}
              onFocus={() => setFocusedIndex(index)}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => onToggle(todo.id)}
                tabIndex={-1}
              />
              <span className="todo-item-text">{todo.text}</span>
              <button
                className="todo-item-delete"
                onClick={() => onRemove(todo.id)}
                tabIndex={-1}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }
);
