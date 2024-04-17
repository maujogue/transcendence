import { navigateTo } from "./Router.js";
import { showComment } from "./Utils.js";

function register(event, registerForm) {
  event.preventDefault();

  const userData = new FormData(registerForm);
  const fetchBody = {
    username: userData.get("username"),
    email: userData.get("email"),
    password1: userData.get("password"),
    password2: userData.get("passwordagain"),
  };

  fetch("https://127.0.0.1:8000/api/users/get_csrf_token/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const csrfToken = data.csrfToken;
      fetch("https://127.0.0.1:8000/api/users/register/", {
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
          if (data.status === "success") {
            showComment(
              "registerComment",
              "Registered, you can now Login",
              "success"
            );
          } else {
            if (data.error && data.error.length > 0)
              showComment("registerComment", data.error[0]);
            else showError("registerComment", "Register Error");
          }
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
    username: userData.get("username"),
    password: userData.get("password"),
  };

  fetch("https://127.0.0.1:8000/api/users/get_csrf_token/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const csrfToken = data.csrfToken;
      fetch("https://127.0.0.1:8000/api/users/login/", {
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
          if (data.status === "success") {
            Cookies.set("isLoggedIn", "true");
            bootstrap.Modal.getInstance(
              document.getElementById("login")
            ).hide();
            navigateTo("/dash");
          } else {
            showError("loginError", "Username or Password incorrect");
          }
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
  fetch("https://127.0.0.1:8000/api/users/get_csrf_token/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const csrfToken = data.csrfToken;
      fetch("https://127.0.0.1:8000/api/users/logout/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            Cookies.remove("isLoggedIn");
            navigateTo("/dash");
          }
        })
        .catch((error) => {
          console.error("logout failed", error);
        });
    })
    .catch((error) => {
      console.error("get csrf token fail", error);
    });
}

function updateProfile(event, updateProfileForm) {
  event.preventDefault();

  const userData = new FormData(updateProfileForm);
  const fetchBody = {
    username: userData.get("username"),
    bio: userData.get("bio"),
    //  avatar: userData.get("avatar"),
  };

  console.log(userData);
  fetch("https://127.0.0.1:8000/api/users/get_csrf_token/", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      const csrfToken = data.csrfToken;
      console.log(csrfToken);
      fetch("https://127.0.0.1:8000/api/users/update_profile/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,
          Accept: "application/json",
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

export { register, login, logout, updateProfile };
