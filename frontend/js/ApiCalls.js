import { navigateTo, logIn} from "./Router.js";
import { showComment } from "./Utils.js";
import { getUserData, setUserData } from "./User.js";

//compares provided user info with current one
async function isUserDataNew(dataName, data) {
  var currentData = await getUserData(dataName);
  return data !== currentData;
}

//closes the passed modal and redirects to /dashboard
function hideModalAndGoHome(modalId) {
  var modal = document.getElementById(modalId);
  modal.addEventListener("hidden.bs.modal", () => navigateTo("/dash"));
  bootstrap.Modal.getInstance(modal).hide();
  modal.removeEventListener("hidden.bs.modal", () => navigateTo("/dash"));
}

//returns the csrf token
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

//execute endpoint and returns the response with status code
async function runEndpoint(endpoint, fetchBody) {
  return fetch("https://127.0.0.1:8000/api/" + endpoint, {
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

// REGISTER FETCH
async function register(registerForm) {
  const userData = new FormData(registerForm);
  const fetchBody = {
    username: userData.get("username"),
    email: userData.get("email"),
    password1: userData.get("password"),
    password2: userData.get("passwordagain"),
  };

  var response = await runEndpoint("users/register/", fetchBody);
  if (response.statusCode === 200) {
    showComment("registerComment", "Registered, you can now Login", "success");
  } else {
    if (data.error && data.error.length > 0)
      showComment("registerComment", data.error[0]);
    else showComment("registerComment", "Register Error");
  }
}

// LOGIN FETCH
async function login(loginForm) {
  const userData = new FormData(loginForm);
  const fetchBody = {
    username: userData.get("username"),
    password: userData.get("password"),
  };

  var response = await runEndpoint("users/login/", fetchBody);

  if (response.statusCode === 200) {
    setUserData();
    Cookies.set("isLoggedIn", "true");
	document.dispatchEvent(logIn);
    bootstrap.Modal.getInstance(document.getElementById("login")).hide();
    navigateTo("/dash");
  } else {
    showComment("loginComment", "Username or Password incorrect");
  }
}

// LOGOUT FETCH
async function logout() {
  var response = await runEndpoint("users/logout/");
  if (response.statusCode === 200) {
    Cookies.remove("isLoggedIn");
    navigateTo("/dash");
  }
}

// UPDATE PROFILE FETCH
//Update a single info with endpoint, fetchbody, the success/error div and the modal to dismiss
async function update_info(endpoint, fetchBody, commentDiv, modaltoDismiss) {
  var response = await runEndpoint(endpoint, fetchBody);
  var data = response.data;

  if (response.statusCode === 200) {
    setTimeout(async () => {
      setUserData();
    }, 1000);
    showComment("confirmPasswordComment", "Profile updated successfully", "success");
    setTimeout(() => {
      hideModalAndGoHome(modaltoDismiss);
    }, 1500);
  } else if (data.error && data.error.length > 0)
    showComment(commentDiv, data.error);
  else showComment(commentDiv, "Username update Error");
  return response;
}

//Update profile infos
async function updateProfile(updateProfileForm) {
  const userData = new FormData(updateProfileForm);
  const fetchBody = {
    username: await getUserData("username"),
    password: userData.get("password"),
  };

  var response = await runEndpoint("users/login/", fetchBody);

  if (response.statusCode === 200) {
    const fetchBody = {
      username: userData.get("username"),
      bio: userData.get("bio"),
    };
    if (await isUserDataNew("username", userData.get("username")))
      update_info(
        "users/update_username/",
        fetchBody,
        "confirmPasswordComment",
        "confirmPasswordModal"
      );
    if (await isUserDataNew("bio", userData.get("bio"))) {
      update_info(
        "users/update_bio/",
        fetchBody,
        "confirmPasswordComment",
        "confirmPasswordModal"
      );
    }
  } else {
    showComment("confirmPasswordComment", "Password Incorrect, try again.");
  }
}

//Update the password
async function updatePassword(updatePasswordForm) {
  const userData = new FormData(updatePasswordForm);
  const fetchBody = {
    username: await getUserData("username"),
    password: userData.get("password"),
  };

  var response = await runEndpoint("users/login/", fetchBody);

  if (response.statusCode === 200) {
    const fetchBody = {
      new_password1: userData.get("new_password1"),
      new_password2: userData.get("new_password2"),
    };
    update_info("update_password/", fetchBody, "updatePasswordComment");
    setTimeout(() => {
      hideModalAndGoHome("updatePasswordModal");
    }, 1500);
  } else {
    showComment("updatePasswordComment", "Password Incorrect, try again.");
  }
}

export {
  register,
  login,
  logout,
  updateProfile,
  updatePassword,
  get_csrf_token,
};
