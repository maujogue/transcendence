import { navigateTo } from "./Router.js";
import { showComment, toggleContentOnLogState } from "./Utils.js";
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
    .then((response) =>
      response.json().then((data) => ({ statusCode: response.status, data }))
    )
    .then(({ statusCode, data }) => {
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
async function login(loginForm) {
	const userData = new FormData(loginForm);
	
	var response = await loginThen(userData.get("username"), userData.get("password"));
	if (response.statusCode === 200) {
        setUserData();
        Cookies.set("isLoggedIn", "true");
        bootstrap.Modal.getInstance(document.getElementById("login")).hide();
        navigateTo("/dash");
      } else {
        showComment("loginComment", "Username or Password incorrect");
      }
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
    .then((response) =>
      response.json().then((data) => ({ statusCode: response.status, data }))
    )
    .then(({ statusCode, data }) => {
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

async function isUserDataNew(dataName, data) {
  var currentData = await getUserData(dataName);
  return data !== currentData;
}

function hideModalAndGoHome(modalId) {
  var modal = document.getElementById(modalId);
  modal.addEventListener("hidden.bs.modal", () => navigateTo("/dash"));
  bootstrap.Modal.getInstance(modal).hide();
  modal.removeEventListener("hidden.bs.modal", () => navigateTo("/dash"));
}

async function update_info(endpoint, fetchBody, commentDiv) {
  fetch("https://127.0.0.1:8000/api/users/" + endpoint, {
    method: "POST",
    headers: {
      "X-CSRFToken": await get_csrf_token(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    body: JSON.stringify(fetchBody),
  })
    .then((response) =>
      response.json().then((data) => ({ statusCode: response.status, data }))
    )
    .then(({ statusCode, data }) => {
      if (statusCode === 200) {
		setTimeout (async () => {
			setUserData();
		},1000);
      } else if (data.error && data.error.length > 0)
        showComment(commentDiv, data.error);
      else showComment(commentDiv, "Username update Error");
    })
    .catch((error) => {
      console.error(endpoint + " Error", error);
    });
}

async function loginThen(username, password) {
  const fetchBody = {
    username: username,
    password: password,
  };
  return fetch("https://127.0.0.1:8000/api/users/login/", {
    method: "POST",
    headers: {
      "X-CSRFToken": await get_csrf_token(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    body: JSON.stringify(fetchBody),
  })
    .then((response) => {
      return response.json().then((data) => {
        return { statusCode: response.status, data };
      });
    })
    .catch((error) => {
      console.error("Authentification failed", error);
    });
}

async function updateProfile(updateProfileForm) {
  const userData = new FormData(updateProfileForm);

  var response = await loginThen(await getUserData("username"), userData.get("password"));

  if (response.statusCode === 200) {
    const fetchBody = {
      username: userData.get("username"),
      bio: userData.get("bio"),
    };
    if (await isUserDataNew("username", userData.get("username")))
      update_info("update_username/", fetchBody, "confirmPasswordComment");
    if (await isUserDataNew("bio", userData.get("bio")))
      update_info("update_bio/", fetchBody, "confirmPasswordComment");
	  showComment("confirmPasswordComment", "Profile Updated Successfully", "success");
	  setTimeout( () => {
		  hideModalAndGoHome("confirmPasswordModal");
	  }, 1500 );
  } else {
    showComment("confirmPasswordComment", "Password Incorrect, try again.");
  }
}

async function updatePassword(updatePasswordForm) {
  const userData = new FormData(updatePasswordForm);

  var response = await loginThen(await getUserData("username"), userData.get("password"));

  if (response.statusCode === 200) {
    const fetchBody = {
		new_password1: userData.get("new_password1"),
		new_password2: userData.get("new_password2"),
    };
    update_info("update_password/", fetchBody, "updatePasswordComment");
	showComment("updatePasswordComment", "Password Updated Successfully", "success");
	setTimeout( () => {
		hideModalAndGoHome("updatePasswordModal");
	}, 1500 );

  } else {
    showComment("updatePasswordComment", "Password Incorrect, try again.");
  }
}

export { register, login, logout, updateProfile, updatePassword, get_csrf_token };