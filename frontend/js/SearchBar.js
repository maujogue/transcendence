import { checkInputAvailable } from "./ApiCalls.js";

export async function getFriendName(event){
    var form = document.getElementById("search-form");
    var data = new FormData(form);
    const friendName = data.get('friendName');

    var usernameAvailable = await checkInputAvailable(friendName, "username");
    if (!usernameAvailable)
        console.log("exist !");
    else
        console.log("does not exist.");
}

async function sendFriendRequest() {
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
            if (dataElement) 
                return data.user[dataElement];
            else 
                return data.user;
            } else 
            console.log("User not Logged in:", data.error);
            return null;
        })
        .catch((error) => {});
}