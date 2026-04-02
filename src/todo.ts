import type { TodoItem } from "./storage";

export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function addTodo(
  todos: readonly TodoItem[],
  text: string
): readonly TodoItem[] {
  const trimmed = text.trim();
  if (trimmed === "") return todos;
  return [...todos, { id: createId(), text: trimmed, done: false }];
}

export function toggleTodo(
  todos: readonly TodoItem[],
  id: string
): readonly TodoItem[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
}

export function removeTodo(
  todos: readonly TodoItem[],
  id: string
): readonly TodoItem[] {
  return todos.filter((todo) => todo.id !== id);
}

export function renderTodoList(
  container: HTMLUListElement,
  todos: readonly TodoItem[],
  onToggle: (id: string) => void,
  onRemove: (id: string) => void
): void {
  container.innerHTML = "";
  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = `todo-item${todo.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => onToggle(todo.id));

    const span = document.createElement("span");
    span.className = "todo-item-text";
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-item-delete";
    deleteBtn.textContent = "\u00d7";
    deleteBtn.addEventListener("click", () => onRemove(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    container.appendChild(li);
  }
}
