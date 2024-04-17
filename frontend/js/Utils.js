function isLoggedIn() {
    return Cookies.get('isLoggedIn') === 'true';
}

function toggleContentOnLogState() {
	const logInContent = document.querySelectorAll(".logInContent");
	const logOutContent = document.querySelectorAll(".logOutContent");

	if (isLoggedIn())
	{
		logInContent.forEach( (e) => e.style.display = "block");
		logOutContent.forEach( (e) => e.style.display = "none");
	}
	else
	{
		logInContent.forEach( (e) => e.style.display = "none");
		logOutContent.forEach( (e) => e.style.display = "block");
	}
}

function showComment (element, errorMsg, success) {
	var commentDiv = document.getElementById(element);
	var bgColor = success ? "bg-success" : "bg-danger";
	commentDiv.innerHTML = errorMsg;

	commentDiv.classList.remove("d-none");
	commentDiv.classList.add(bgColor); 
	setTimeout(function(){
		commentDiv.classList.add("d-none"); 
		commentDiv.classList.remove(bgColor); 
   }, 3000);
}

export {toggleContentOnLogState, showComment}