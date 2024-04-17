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

export { toggleContentOnLogState, showComment, isLoggedIn };
