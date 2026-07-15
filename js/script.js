// 1. Select the DOM elements

const myInput = document.getElementById("myInput");
const addButton = document.getElementById("addButton");
const todolist = document.getElementById("todoList");
const MyCheckbox = document.getElementById("MyCheckbox");
// const myCheckbox = document.querySelectorAll('.myUL [name="todo-item-done"]');
// const myLabel = document.getElementById('todo-item-label');

//Two tasks already exist in the HTML so the next ID is 0.
let nextTodoId = 0;

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
  const taskCheckbox = MyCheckbox.checked;

  if (taskName.trim() === "") {
    alert("Please enter a task.");
    myInput.focus();

    if (taskCheckbox.checked) {
      taskCheckbox.checked = true;
      return;
    } else {
      taskCheckbox.checked = false;
    }

    return;
    createtodoListFile();
  }

  createTodoElement(taskName, taskCheckbox);
  removeTodoListFile();
  createTodoListFile();

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
// Remove txt file
function removeTodoListFile() {
  fetch("./todosCopy.txt", { method: "DELETE" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete todos.txt");
      } else {
        console.log("todos.txt deleted successfully");
      }
    })
    .catch((error) => {
      console.error("Error deleting todos.txt:", error);
    });
  console.log("todos.txt deleted successfully");
}
// Create txt file
function createTodoListFile() {
  fetch("./todosCopy.txt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create todos.txt");
      } else {
        console.log("todos.txt created successfully");
      }
    })
    .catch((error) => {
      console.error("Error creating todos.txt:", error);
    });
  console.log("todos.txt created successfully");
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

// Load tasks from todoList.txt
async function loadTodoItems() {
  try {
    const response = await fetch("./todos.txt");

    if (!response.ok) {
      throw new Error("unsable to load todos.txt : ${response.status}");
    }
    const text = await response.text();
    const todoItems = JSON.parse(text);

    todoItems.forEach(function (todo) {
      createTodoElement(todo.Name, todo.itemDone);
    });
  } catch (error) {
    console.error("Error loading todo items:", error);
  }
}

loadTodoItems();

// myCheckbox.forEach(cb => {
//   cb.checked = true;
// });
// myCheckbox[0].classList.remove('old-class-checkbox');
// myLabel.innerHTML = "read a chapter of a book";
