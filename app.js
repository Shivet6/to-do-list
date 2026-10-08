const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const message = document.querySelector("#message");
const storageKey = "todo-list-items";

function loadTodos() {
  const savedTodos = localStorage.getItem(storageKey);
  if (!savedTodos) return [];

  const todos = JSON.parse(savedTodos);
  if (
    !Array.isArray(todos)
    || todos.some((todo) =>
      !todo
      || !Number.isInteger(todo.id)
      || typeof todo.text !== "string"
      || typeof todo.completed !== "boolean"
    )
  ) {
    throw new Error("Saved tasks are invalid. Clear this site's stored data to start fresh.");
  }

  return todos;
}

function saveTodos(todos) {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

function showError(error) {
  message.textContent = error.message;
}

function renderTodos(todos) {
  list.replaceChildren();

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add one above to get started.";
    list.append(empty);
    return;
  }

  for (const todo of todos) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(todo.completed);
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as complete`);
    checkbox.addEventListener("change", () => {
      message.textContent = "";
      try {
        const todos = loadTodos();
        const currentTodo = todos.find((savedTodo) => savedTodo.id === todo.id);
        if (!currentTodo) throw new Error("Task not found.");
        currentTodo.completed = checkbox.checked;
        saveTodos(todos);
        renderTodos(todos);
      } catch (error) {
        showError(error);
        checkbox.checked = !checkbox.checked;
      }
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete "${todo.text}"`);
    remove.addEventListener("click", () => {
      message.textContent = "";
      try {
        const todos = loadTodos().filter((savedTodo) => savedTodo.id !== todo.id);
        saveTodos(todos);
        renderTodos(todos);
      } catch (error) {
        showError(error);
      }
    });

    item.append(checkbox, text, remove);
    list.append(item);
  }
}

try {
  renderTodos(loadTodos());
} catch (error) {
  showError(error);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";
  const text = input.value.trim();
  if (!text) return;

  try {
    const todos = loadTodos();
    const nextId = todos.reduce((largestId, todo) => Math.max(largestId, todo.id), 0) + 1;
    todos.unshift({ id: nextId, text, completed: false });
    saveTodos(todos);
    input.value = "";
    renderTodos(todos);
    input.focus();
  } catch (error) {
    showError(error);
  }
});
