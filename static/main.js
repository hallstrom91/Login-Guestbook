/*
========================
Setup !
======================== 
*/

const switchButton = document.getElementById("switchBtn");
const viewPassword = document.getElementById("viewPassword");
const registerBtn = document.getElementById("regPopUp");
const closeReg = document.getElementById("closeReg");

/*
========================
Toggle Dark / Light Mode
======================== 
*/

switchButton.addEventListener("click", switchTheme);

function switchTheme() {
  // Connect elements
  let bodyElement = document.body;

  // Change color of elements
  bodyElement.classList.toggle("darkMode");
}

/*
========================
View password at login
======================== 
*/
viewPassword.addEventListener("change", passwordViewer);

function passwordViewer() {
  const passwordInput = document.getElementById("password");
  if (this.checked) {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

/*
========================
Register Button
======================== 
*/
registerBtn.addEventListener("click", function () {
  let registerBox = document.getElementById("register");
  registerBox.classList.remove("hidden");
  registerBox.classList.add("container-register");
});

closeReg.addEventListener("click", function () {
  let registerBox = document.getElementById("register");
  registerBox.classList.remove("container-register");
  registerBox.classList.add("hidden");
});
