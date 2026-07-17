/**
 * Client-side To-Do List Logic
 *
 * Responsibilities:
 * - Read initial UI state and build todo <li> items
 * - Handle adding new todos from the input
 * - Toggle done-state when a checkbox changes
 * - Persist the todo list (either to the backend file via fetch, or to localStorage)
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
// (This lets the app safely re-render after loading from storage/file.)
let nextTodoId = (() => {
  const existingIds = Array.from(
    todolist.querySelectorAll('input[type="checkbox"][name="todo-item-done"]'),
  ).map((cb) => {
    // IDs are expected to look like: todo-item-done-<number>
    const m = String(cb.id).match(/todo-item-done-(\d+)/);
    return m ? Number(m[1]) : -1;
  });

  const maxId = existingIds.length ? Math.max(...existingIds) : -1;
  return maxId + 1;
})();

// Create the DOM nodes for a single todo item.
// @param {string} taskName - Label shown next to the checkbox.
// @param {boolean} itemDone - Whether the checkbox starts checked.
function createTodoElement(taskName, itemDone = false) {
  const cleanedTaskName = taskName.trim();

  // Prevent empty list entries.
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
// Triggered by:
// - clicking the Add button
// - pressing Enter while focused in the input
function newElemnt() {
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

  // Persist the updated list so it can be restored later.
  persistTodoList();

  myInput.value = "";
  MyCheckbox.checked = false;
  myInput.focus();
}

// Read the current UI state and convert it to a plain array.
// The resulting objects match the persistence format used elsewhere.
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
// Backend persistence paths (used by the fetch-based persistence flow).
const TODOS_FILE = "./todos.txt";

// Backend endpoint to persist the todo list.
// save.php writes the received JSON array into todos.txt.
const SAVE_ENDPOINT = "./save.php";

// Persist todo list to the backend file by POSTing JSON.
async function persistTodoList() {
  const todoItems = readTodoList();

  // Store as JSON so the server can serialize it safely to todos.txt.
  const payload = JSON.stringify(todoItems);

  // Write via server-side endpoint (browsers can't write local files directly).
  try {
    await fetch(SAVE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
  } catch (e) {
    console.error("Failed to persist todos to file:", e);
  }
}

// Load and render todo items from the backend text file.
async function loadTodoListFromFile() {
  try {
    // Fetching TODOS_FILE should return JSON text.
    const response = await fetch(TODOS_FILE);

    if (!response.ok) {
      throw new Error(`Failed to load ${TODOS_FILE}: ${response.status}`);
    }

    const text = await response.text();
    const todoItems = JSON.parse(text);
    if (!Array.isArray(todoItems)) return;

    // Clear current items before re-hydrating from storage.
    todolist.innerHTML = "";

    // Reset id generator for a clean re-render.
    nextTodoId = 0;

    todoItems.forEach((todo) => {
      if (!todo) return;
      createTodoElement(todo.Name ?? "", Boolean(todo.itemDone));
    });
  } catch (e) {
    console.error("Error loading todo items:", e);
  }
}

// Connect the button and enter key
addButton.addEventListener("click", newElemnt);

myInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    newElemnt();
  }
});

// Persist on checkbox change.
// When the checkbox toggles, we update the label styling and persist the list.
todolist.addEventListener("change", function (event) {
  if (event.target.matches('[name="todo-item-done"]')) {
    // In this DOM structure, the label is the next sibling after the checkbox.
    const label = event.target.nextElementSibling;

    // Toggle the CSS class to show a "done" state.
    label.classList.toggle("label-done", event.target.checked);

    // Persist the updated state.
    persistTodoList();
  }
});

// Initial render: load tasks from todos.txt.
loadTodoListFromFile();

// myCheckbox.forEach(cb => {
//   cb.checked = true;
// });
// myCheckbox[0].classList.remove('old-class-checkbox');
// myLabel.innerHTML = "read a chapter of a book";
