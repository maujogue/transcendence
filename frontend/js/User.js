import { get_csrf_token } from "./ApiCalls.js";
import { isLoggedIn } from "./Utils.js";

async function injectUserData() {
	if (isLoggedIn())
	{
		var userInfos = await getUserData();
		
		Object.keys(userInfos).forEach((info) => {
			var usernameDivs = document.querySelectorAll("." + info + "Dynamic");
			usernameDivs.forEach((div) => {
				if (div.tagName === "INPUT") div.value = userInfos[info];
				else if (div.tagName === "IMG") div.setAttribute("src", "data:image/png;base64," + userInfos[info]);
				else div.innerHTML = userInfos[info];
			});
		});
	}
}

async function getUserData(dataElement) {
  return fetch("https://127.0.0.1:8000/api/users/get_user_data/", {
    method: "GET",
    headers: {
      "X-CSRFToken": await get_csrf_token(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
		if (data.error) 
			throw new Error(data.error);
		if (dataElement)
			return data.user[dataElement];
		else 
			return data.user;
    })
	.catch((error) => {
		console.error("getUserData", error);
	});
}

export { getUserData, injectUserData };
