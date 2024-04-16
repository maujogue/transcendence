function isLoggedIn() {
    return Cookies.get('isLoggedIn') === 'true';
}

function toggleContentOnLogState() {
	const logInContent = document.querySelectorAll(".logInContent");
	const logOutContent = document.querySelectorAll(".logOutContent");

	if (isLoggedIn())
	{
		console.log("logged in");
		logInContent.forEach( (e) => e.style.display = "block");
		logOutContent.forEach( (e) => e.style.display = "none");
	}
	else
	{
		console.log("logged out");
		logInContent.forEach( (e) => e.style.display = "none");
		logOutContent.forEach( (e) => e.style.display = "block");
	}
}

export {toggleContentOnLogState}