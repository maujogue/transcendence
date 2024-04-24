//check if user is logged in
function isLoggedIn() {
  return Cookies.get("isLoggedIn") === "true";
}

//change content based on user log state
function toggleContentOnLogState() {
  const logInContent = document.querySelectorAll(".logInContent");
  const logOutContent = document.querySelectorAll(".logOutContent");

  if (isLoggedIn()) {
    logInContent.forEach((e) => (e.style.display = "block"));
    logOutContent.forEach((e) => (e.style.display = "none"));
  } else {
    logInContent.forEach((e) => (e.style.display = "none"));
    logOutContent.forEach((e) => (e.style.display = "block"));
  }
  sidebarOnStart();
}

//disable sidebar collapse if user isn't logged in
function sidebarOnStart() {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content-container");
  if (!isLoggedIn()) {
    sidebar.classList.remove("collapsed");
    content.classList.remove("collapsed");
    var sectionNames = document.querySelectorAll(".section-name");
    sectionNames.forEach(function (name) {
      name.classList.remove("section-name-collapsed");
    });
  }
}

//show success/error message on submit (login/register)
function showComment(element, errorMsg, success) {
  var commentDiv = document.getElementById(element);
  var bgColor = success ? "bg-success" : "bg-danger";
  commentDiv.innerHTML = errorMsg;

  commentDiv.classList.remove("d-none");
  commentDiv.classList.add(bgColor);
  setTimeout(function () {
    commentDiv.classList.add("d-none");
    commentDiv.classList.remove(bgColor);
  }, 3000);
}

//hide-show toggle for password form input
function togglePasswordVisibility(togglePasswordInputId, passwordFieldId) {
  var togglePassword = document.getElementById(togglePasswordInputId);
  var passwordField = document.getElementById(passwordFieldId);
  togglePassword.addEventListener("click", () => {
	  if (passwordField.type === "password") {
		  passwordField.type = "text";
		  togglePassword.classList.remove("fa-eye");
		  togglePassword.classList.add("fa-eye-slash");
		} else {
			passwordField.type = "password";
			togglePassword.classList.remove("fa-eye-slash");
			togglePassword.classList.add("fa-eye");
		}
	});
}

//check password attribute with given regEx expression
function checkPasswordAttribute(regEx, elementID, password) {
	var dynamicColorDiv = document.getElementById(elementID);
	if (regEx.test(password.value)) dynamicColorDiv.style.color = "green";
	else dynamicColorDiv.style.color = "red";
  }
  
  function checkPassword(category, password1, password2) {
	checkPasswordAttribute(/^.{8,20}$/, category + "PassLength", password1);
	checkPasswordAttribute(/^.*[a-z].*$/, category + "PassLowercase", password1);
	checkPasswordAttribute(/^.*[A-Z].*$/, category + "PassUppercase", password1);
	checkPasswordAttribute(/^.*[0-9].*$/, category + "PassNumbers", password1);
	checkPasswordAttribute(/^.*[!@#$%^&*_=+].*$/, category + "PassSpecial", password1);
  
	var helpTextAgain = document.getElementById(category + "PasswordAgainHelpBlock");
	if (password2.value !== "" && password1.value !== password2.value)
	  helpTextAgain.classList.remove("d-none");
	else helpTextAgain.classList.add("d-none");
  }
  
export {
  toggleContentOnLogState,
  showComment,
  isLoggedIn,
  togglePasswordVisibility,
  checkPassword,
};
