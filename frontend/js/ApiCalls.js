function register (event, registerForm){
    event.preventDefault();

    const userData = new FormData(registerForm);
	const fetchBody = {
	     username: userData.get("username"),
	     email: userData.get("email"),
	     password: userData.get("password"),
	     password1: userData.get("password"),
	     password2: userData.get("passwordagain"),
	}
	console.log(userData);

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
				"X-CSRFToken": csrfToken,
				"Content-Type": "application/x-www-form-urlencoded",
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
}

function login(event, loginForm) {
    event.preventDefault();

    const userData = new FormData(loginForm);
	const fetchBody = {
	     email: userData.get("username"),
	     password: userData.get("password"),
	}

	fetch("https://127.0.0.1:8000/api/get_csrf_token/", {
		method: "GET",
		credentials: "include",
	})
	.then((response) => response.json())
	.then((data) => {
		const csrfToken = data.csrfToken;
		console.log(csrfToken);
		fetch("https://127.0.0.1:8000/api/login/", {
			method: "POST",
			headers: {
				"X-CSRFToken": csrfToken,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			credentials: "include",
			body: JSON.stringify(fetchBody),
		})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
		})
		.catch((error) => {
			console.error("login failed", error);
		});
	})
	.catch((error) => {
		console.error("get csrf token fail", error);
	});
}

function logout() {
  fetch("https://127.0.0.1:8000/api/get_csrf_token/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const csrfToken = data.csrfToken;
      console.log(csrfToken);
      fetch("https://127.0.0.1:8000/api/logout_view/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          // Handle logout success
        })
        .catch((error) => {
          console.error("logout failed", error);
          // Handle logout failure
        });
    })
    .catch((error) => {
      console.error("get csrf token fail", error);
    });
}

function updateProfile(event, userDataForm) {
    event.preventDefault();

    const userData = new FormData(userDataForm);
	const fetchBody = {
	     email: userData.get("username"),
	     password: userData.get("password"),
	}

	fetch("https://127.0.0.1:8000/api/get_csrf_token/", {
		method: "GET",
		credentials: "include",
	})
	.then((response) => response.json())
	.then((data) => {
		const csrfToken = data.csrfToken;
		console.log(csrfToken);
		fetch("https://127.0.0.1:8000/api/update_profile/", {
			method: "POST",
			headers: {
				"X-CSRFToken": csrfToken,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			credentials: "include",
			body: JSON.stringify(fetchBody),
		})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
		})
		.catch((error) => {
			console.error("login failed", error);
		});
	})
	.catch((error) => {
		console.error("get csrf token fail", error);
	});
}

export {register, login, logout, updateProfile}