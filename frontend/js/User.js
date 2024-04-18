import { get_csrf_token } from "./ApiCalls.js";


//fill cookies with user infos
async function setUserData() {
  var user = await getUserData();
  Object.keys(user).forEach((element) => {
	console.log(element, user[element]);
    Cookies.set(element, user[element]);
  });
}

//fill pages with user infos
function injectUserData() {
  var userInfos = [
    "username",
    "email",
    "bio",
    "title",
    "n_games_played",
    "rank",
    "winrate",
  ];
  userInfos.forEach((info) => {
	console.log(info);
    var usernameDivs = document.querySelectorAll("." + info + "Dynamic");
    usernameDivs.forEach((div) => {

      if (div.tagName === "INPUT") div.setAttribute("value", Cookies.get(info));
      else
	  div.innerHTML = Cookies.get(info);
    });
  });
}

async function getUserData(dataElement) {
  return fetch("https://127.0.0.1:8000/api/users/get_user_data/", {
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
        if (dataElement) return data.user[dataElement];
        else return data.user;
      } else console.log("getUserData failed:", data.error);
    })
    .catch((error) => {
      console.error("getUserData failed", error);
    });
}

export { getUserData, setUserData, injectUserData };
