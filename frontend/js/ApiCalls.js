import { navigateTo } from "./Router.js";
import { showComment } from "./Utils.js";
import { injectUserData, getUserData, setUserData } from "./User.js";

function get_csrf_token() {
  return fetch("https://127.0.0.1:8000/api/users/get_csrf_token/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => data.csrfToken)
    .catch((error) => {
      console.error("get csrf token fail", error);
    });
}

// REGISTER FETCH

async function register(event, registerForm) {
  event.preventDefault();

  const userData = new FormData(registerForm);
  const fetchBody = {
    username: userData.get("username"),
    email: userData.get("email"),
    password1: userData.get("password"),
    password2: userData.get("passwordagain"),
  };

  fetch("https://127.0.0.1:8000/api/users/register/", {
    method: "POST",
    headers: {
      "X-CSRFToken": await get_csrf_token(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    body: JSON.stringify(fetchBody),
  })
  .then((response) => response.json()
  .then(data => ({ statusCode: response.status, data })))
  .then(({statusCode, data}) => {
	  console.log(statusCode);
	  if (statusCode === 200) {
        showComment(
          "registerComment",
          "Registered, you can now Login",
          "success"
        );
      } else {
        if (data.error && data.error.length > 0)
          showComment("registerComment", data.error[0]);
        else showComment("registerComment", "Register Error");
      }
    })
    .catch((error) => {
      console.error("register failed", error);
    });
}

// LOGIN FETCH

async function login(event, loginForm) {
  event.preventDefault();

	const userData = new FormData(loginForm);
  const fetchBody = {
    username: userData.get("username"),
    password: userData.get("password"),
  };

  fetch("https://127.0.0.1:8000/api/users/login/", {
    method: "POST",
    headers: {
      "X-CSRFToken": await get_csrf_token(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    body: JSON.stringify(fetchBody),
  })
    .then((response) => response.json()
	.then(data => ({ statusCode: response.status, data })))
    .then(({statusCode, data}) => {
		console.log(statusCode);
		if (statusCode === 200) {
			setUserData();
			Cookies.set("isLoggedIn", "true");
			bootstrap.Modal.getInstance(document.getElementById("login")).hide();
			navigateTo("/dash");
      } else {
        showComment("loginComment", "Username or Password incorrect");
      }
    })
    .catch((error) => {
      console.error("login failed", error);
    });
}

// LOGOUT FETCH

async function logout() {
  fetch("https://127.0.0.1:8000/api/users/logout/", {
    method: "POST",
    headers: {
      "X-CSRFToken": await get_csrf_token(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
  })
  .then((response) => response.json()
  .then(data => ({ statusCode: response.status, data })))
  .then(({statusCode, data}) => {
	  console.log(statusCode);
	  if (statusCode === 200) {
        Cookies.remove("isLoggedIn");
        navigateTo("/dash");
      }
    })
    .catch((error) => {
      console.error("logout failed", error);
    });
}

// UPDATE PROFILE FETCH

async function updateProfile(event, updateProfileForm) {
  event.preventDefault();
  console.log(updateProfileForm);

  const userData = new FormData(updateProfileForm);
  console.log("current username: ", await getUserData("username"));
  console.log("form username: ", userData.get("username"));

  const fetchBody = {
    username: await getUserData("username"),
    password: userData.get("password"),
    bio: userData.get("bio"),
    avatar: userData.get("avatar"),
  };
  fetch("https://127.0.0.1:8000/api/users/login/", {
    method: "POST",
    headers: {
		
      "X-CSRFToken": await get_csrf_token(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    body: JSON.stringify(fetchBody),
  })
  .then((response) => response.json()
  .then(data => ({ statusCode: response.status, data })))
  .then(({statusCode, data}) => {
	  console.log(statusCode);
	  if (statusCode === 200) {
		update_username(userData.get("username"));
	  }
	  else {
		showComment("confirmPasswordComment", "Password Incorrect, try again.");
	  }
    })
    .catch((error) => {
      console.error("login failed", error);
    });
}

function hideModalAndGoHome(modalId) {
	var modal = document.getElementById(modalId);
	modal.addEventListener("hidden.bs.modal", () => navigateTo("/dash"));
	bootstrap.Modal.getInstance(modal).hide();
	modal.removeEventListener("hidden.bs.modal", () => navigateTo("/dash"));
}

async function update_username(username) {
  
	const fetchBody = {
	  username: username,
	};
  
	fetch("https://127.0.0.1:8000/api/users/update_username/", {
	  method: "POST",
	  headers: {
		"X-CSRFToken": await get_csrf_token(),
		"Content-Type": "application/x-www-form-urlencoded",
	  },
	  credentials: "include",
	  body: JSON.stringify(fetchBody),
	})
	.then((response) => response.json()
	.then(data => ({ statusCode: response.status, data })))
	.then(({statusCode, data}) => {
		console.log(statusCode);
		if (statusCode === 200) {
			setUserData();
			hideModalAndGoHome("confirmPasswordModal");
		}
		else if (data.error && data.error.length > 0)
          showComment("confirmPasswordComment", data.error);
		else
          showComment("confirmPasswordComment", "Username change Error");

	  })
	  .catch((error) => {
		console.error("login failed", error);
	  });
  }
export { register, login, logout, updateProfile, get_csrf_token };
