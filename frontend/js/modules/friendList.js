import { getModuleDiv } from "../Modules.js";
import { runEndPoint } from "../ApiUtils.js"
import { showAlert, disableCollapsedSidebar } from "../Utils.js";
import { checkInputAvailable } from "../ApiCalls.js";
import { sendWebSocketMessage } from "../Friends.js";

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

		await getFriendName(fetchBody.username);
	}

	async function getFriendName(username){
		var friend_username = await checkInputAvailable(username, "username");
		if (!friend_username)
			sendFriendRequest(username);
		else
			showAlert("This user does not exist.", false);
	}

	async function sendFriendRequest(friend_username){
		var response;
		const fetchBody = {
			username: friend_username
		};

		response = await runEndPoint("friends/send_request/" + friend_username + "/", JSON.stringify(fetchBody));

		if (response.statusCode === 200) {
			showAlert("You just send a friend request to " + friend_username + "  !", true);
			sendWebSocketMessage ({
				type: 'friend_request',
				to: friend_username
			});

		} else if (response.data.message === "Request already send.") {
			showAlert("FRIEND REQUEST ALREADY SEND.", false);
		} else if (response.data.message === "Cannot send a request to himself.") {
			showAlert("You cannot send a friend request to yourself.", false);
		} else {
			showAlert("FRIEND REQUEST NOT SEND.", false);
		}
	}
}

