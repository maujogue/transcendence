import { getModuleDiv } from "../Modules.js";
import { runEndPoint } from "../ApiUtils.js"
import { showAlert, disableCollapsedSidebar } from "../Utils.js";
import { checkInputAvailable } from "../ApiCalls.js";

export async function init() {
	var module = getModuleDiv("friendList");
	if (!module)
		return;

	var friendScroll = module.querySelector("#friendScroll");
	var searchFriendForm = module.querySelector("#searchFriendForm");
	searchFriendForm.addEventListener("submit", (event) => {
		event.preventDefault();
		searchFriend(event.target);
	});

	var friendListHtml = `<a class="ms-2 align-items-center text-white" data-bs-toggle="dropdown" navlink>
	<img width="30" height="30" class="rounded-circle me-3 avatarDynamic" />
	<span class="mt-1 usernameDynamic section-name"></span>
	</a>`;
	for (var i = 0; i < 5; i++)
		friendScroll.innerHTML += friendListHtml;
	var response = await runEndPoint("friends/get_friendslist/");
	console.log(response);

	async function searchFriend(searchFriendForm) {
		const userData = new FormData(searchFriendForm);
		const fetchBody = {
			username: userData.get("username"),
		};
		console.log(searchFriendForm, fetchBody["username"]);
	
		// var response = await runEndPoint("friends/send_request/" + userData.get("username") + "/");
		// if (response.statusCode === 200) {
		// 	showAlert(response.data.success);
		// } else {
		// 	showAlert(response.data.error);
		// }
		// console.log(response);

		await getFriendName(fetchBody.username);
	}

	async function getFriendName(username){
	
		var usernameAvailable = await checkInputAvailable(username, "username");
		if (!usernameAvailable)
			showAlert("exist !", true);
		else
			showAlert("does not exist.", false);
	}
}




