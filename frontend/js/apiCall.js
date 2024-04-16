var form = document.getElementById('registrationForm');
form.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const userData = new FormData(form);
	const fetchBody = {
	     username: userData.get("username"),
	     email: userData.get("email"),
	     password: userData.get("password"),
	     password1: userData.get("passwordagain"),
	     password2: userData.get("password"),
	}

	fetch("https://127.0.0.1:8000/api/get_csrf_token/", {
		method: "GET",
		credentials: "include",
	})
	.then((response) => response.json())
	.then((data) => {
		const csrfToken = data.csrfToken;
		console.log(csrfToken);
		fetch("https://127.0.0.1:8000/api/register/", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-CSRFToken": csrfToken,
			},
			credentials: "include",
			body: JSON.stringify(fetchBody),
		})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
		})
		.catch((error) => {
			console.error("register failed", error);
		});
	})
	.catch((error) => {
		console.error("get csrf token fail", error);
	});
})


