/**
 * Client-side To-Do List Logic
 *
 * Responsibilities:
 * - Render todo items into the <ul id="todoList">
 * - Add new tasks from the input
 * - Toggle done-state and persist changes to todos.txt
 */

// 1) Select the DOM elements we interact with.
const myInput = document.getElementById("myInput");
const addButton = document.getElementById("addButton");
const todolist = document.getElementById("todoList");
const MyCheckbox = document.getElementById("MyCheckbox");

// Legacy / experimental selectors (kept as comments for reference).
// const myCheckbox = document.querySelectorAll('.myUL [name="todo-item-done"]');
// const myLabel = document.getElementById('todo-item-label');

// Next ID: compute from existing DOM to avoid collisions with pre-seeded markup.
// IDs look like: todo-item-done-<number>
let nextTodoId = (() => {
  const existingIds = Array.from(
    todolist.querySelectorAll('input[type="checkbox"][name="todo-item-done"]'),
  ).map((cb) => {
    const m = String(cb.id).match(/todo-item-done-(\d+)/);
    return m ? Number(m[1]) : -1;
  });

  const maxId = existingIds.length ? Math.max(...existingIds) : -1;
  return maxId + 1;
})();

// Create the DOM nodes for a single todo item.
// @param {string} taskName
// @param {boolean} itemDone
function createTodoElement(taskName, itemDone = false) {
  const cleanedTaskName = taskName.trim();

  // Skip empty entries.
  if (cleanedTaskName === "") {
    return;
  }

  const listItem = document.createElement("li");
  listItem.classList.add("todo-item");

  const checkboxId = `todo-item-done-${nextTodoId}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = "todo-item-done";
  checkbox.id = checkboxId;
  checkbox.checked = itemDone;

  const label = document.createElement("label");
  label.htmlFor = checkboxId;
  label.textContent = cleanedTaskName;

  label.classList.toggle("label-done", itemDone);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "todo-delete-button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    listItem.remove();
    await persistTodoList();
  });

  listItem.append(checkbox, label, deleteButton);
  todolist.appendChild(listItem);

  nextTodoId++;
}
// Add a Task from the Input Field.
// Triggered by the Add button click and the Enter key.
async function newElemnt() {
  const taskName = myInput.value;
  const itemDone = MyCheckbox.checked;

  const cleanedTaskName = taskName.trim();
  if (cleanedTaskName === "") {
    alert("Please enter a task.");
    myInput.focus();
    return;
  }

  // Render the new item in the UI.
  createTodoElement(cleanedTaskName, itemDone);

  await persistTodoList();

  myInput.value = "";
  MyCheckbox.checked = false;
  myInput.focus();
}

// Read the current UI state and convert it to a plain array.
// The saved objects have the shape: { Name: string, itemDone: boolean }
function readTodoList() {
  const todoItems = [];
  const listItems = todolist.querySelectorAll("li");
  for (const listItem of listItems) {
    const label = listItem.querySelector("label");
    const checkbox = listItem.querySelector('input[type="checkbox"]');
    todoItems.push({
      Name: label.textContent,
      itemDone: checkbox.checked,
    });
  }
  return todoItems;
}

const appBaseUrl = new URL("./", window.location.href);
const TODOS_FILE = new URL("todos.txt", appBaseUrl).toString();
const SAVE_ENDPOINT = new URL("save.php", appBaseUrl).toString();

// Persist current todo list to todos.txt through the PHP save endpoint.
async function persistTodoList() {
  const todoItems = readTodoList();
  const payload = JSON.stringify(todoItems);

  try {
    const response = await fetch(SAVE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      throw new Error(`Save failed: ${json.error ?? response.status}`);
    }

    return json;
  } catch (e) {
    console.error("Failed to persist todos to file:", e);
    return null;
  }
}

// Load todo list from todos.txt and re-render the UI.
async function loadTodoListFromFile() {
  try {
    const response = await fetch(TODOS_FILE);
    if (!response.ok) {
      throw new Error(`Failed to load ${TODOS_FILE}: ${response.status}`);
    }

    const text = await response.text();
    const todoItems = JSON.parse(text);
    if (!Array.isArray(todoItems)) return;

    // Clear current items before re-hydrating from storage.
    todolist.innerHTML = "";
    nextTodoId = 0;

    todoItems.forEach((todo) => {
      if (!todo) return;
      createTodoElement(todo.Name ?? "", Boolean(todo.itemDone));
    });
  } catch (e) {
    console.error("Error loading todo items:", e);
  }
}

// Connect the UI events.
addButton.addEventListener("click", function (event) {
  event.preventDefault();
  newElemnt();
});

// Pressing Enter while typing triggers adding the task.
myInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    newElemnt();
  }
});

// Toggle done-state + persist when a checkbox changes.
todolist.addEventListener("change", async function (event) {
  if (event.target.matches('[name="todo-item-done"]')) {
    // In the DOM structure, label is the sibling after the checkbox.
    const label = event.target.nextElementSibling;

    // Apply the done styling.
    label.classList.toggle("label-done", event.target.checked);

    // Persist updated list.
    await persistTodoList();
  }
});

// Initial render: load tasks from todos.txt.
loadTodoListFromFile();

// myCheckbox.forEach(cb => {
//   cb.checked = true;
// });
// myCheckbox[0].classList.remove('old-class-checkbox');
// myLabel.innerHTML = "read a chapter of a book";
