// 1. Select the DOM elements
 
const myCheckbox = document.querySelectorAll('.myUL [name="todo-item-done"]');
const myLabel = document.getElementById('todo-item-label');


myCheckbox.forEach(cb => {
  cb.checked = true;
});
myCheckbox[0].classList.remove('old-class-checkbox');
myLabel.innerHTML = "read a chapter of a book";

