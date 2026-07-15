// 1. Select the DOM elements

const myInput = document.getElementById("myInput");
const addButton = document.getElementById("addButton");
const todolist = document.getElementById("todoList");
const MyCheckbox = document.getElementById("MyCheckbox");
// const myCheckbox = document.querySelectorAll('.myUL [name="todo-item-done"]');
// const myLabel = document.getElementById('todo-item-label');

// Next ID: compute from existing DOM to avoid collisions with pre-seeded markup
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

// Write the Function That Creates One Task
function createTodoElement(taskName, itemDone = false) {
  const cleanedTaskName = taskName.trim();
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

  listItem.append(checkbox, label);
  todolist.appendChild(listItem);

  nextTodoId++;
}
// Add a Task from the Input Field
function newElemnt() {
  const taskName = myInput.value;
  const itemDone = MyCheckbox.checked;

  const cleanedTaskName = taskName.trim();
  if (cleanedTaskName === "") {
    alert("Please enter a task.");
    myInput.focus();
    return;
  }

  createTodoElement(cleanedTaskName, itemDone);
  persistTodoList();

  myInput.value = "";
  MyCheckbox.checked = false;
  myInput.focus();
}

// Add entire list to an array
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
const STORAGE_KEY = "todoList.items.v1";

function persistTodoList() {
  const todoItems = readTodoList();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todoItems));
}

function loadTodoListFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const todoItems = JSON.parse(raw);
    if (!Array.isArray(todoItems)) return;

    // Clear current items before re-hydrating from storage.
    todolist.innerHTML = "";

    nextTodoId = 0;
    todoItems.forEach((todo) => {
      if (!todo) return;
      createTodoElement(todo.Name ?? "", Boolean(todo.itemDone));
    });
  } catch (e) {
    console.error("Failed to parse stored todo list", e);
  }
}

// Connect the button and enter key
addButton.addEventListener("click", newElemnt);

myInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    newElemnt();
  }
});

todolist.addEventListener("change", function (event) {
  if (event.target.matches('[name="todo-item-done"]')) {
    const label = event.target.nextElementSibling;
    label.classList.toggle("label-done", event.target.checked);
  }
});

// Load tasks from localStorage
loadTodoListFromStorage();

// myCheckbox.forEach(cb => {
//   cb.checked = true;
// });
// myCheckbox[0].classList.remove('old-class-checkbox');
// myLabel.innerHTML = "read a chapter of a book";
