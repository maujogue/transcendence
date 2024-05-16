import { getModuleDiv } from "../Modules.js";
import { runEndPoint } from "../ApiUtils.js"
import { showAlert, disableCollapsedSidebar } from "../Utils.js";

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
	for (var i = 0; i < 50; i++)
		friendScroll.innerHTML += friendListHtml;
	var response = await runEndPoint("friends/get_friendslist/");
	console.log(response);

	async function searchFriend(searchFriendForm) {
		const userData = new FormData(searchFriendForm);
		const fetchBody = {
			username: userData.get("username"),
		};
		console.log(searchFriendForm, fetchBody["username"]);
	
		showAlert("User does not exist!")
		// var response = await runEndPoint("friends/send_request/" + userData.get("username") + "/");
		// if (response.statusCode === 200) {
		// 	showAlert(response.data.success);
		// } else {
		// 	showAlert(response.data.error);
		// }
		// console.log(response);
	}
}
