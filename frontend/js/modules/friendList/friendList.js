import { getModuleDiv } from "../../Modules.js";
import { runEndPoint } from "../../ApiUtils.js"
import { showAlert, disableCollapsedSidebar } from "../../Utils.js";
import { checkInputAvailable } from "../../ApiCalls.js";
import { sendFriendsWebSocketMessage } from "../../Friends.js";
import { getUserData } from "../../User.js";

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

	printFriendsList(friendScroll);

	async function searchFriend(searchFriendForm) {
		const userData = new FormData(searchFriendForm);
		const fetchBody = {
			username: userData.get("username"),
		};
		if (!fetchBody.username) 
			return showAlert("Please enter a valid username.");

		sendFriendRequest(fetchBody.username);
	}
	
	async function sendFriendRequest(username){
		let message = {
			'type': 'friend_request',
			'from_user':  await getUserData('username'),
			'to_user': username,
		}
		sendFriendsWebSocketMessage(message);
	}

	async function printFriendsList(friendScroll) {
		console.log('printFriendsList');
		var friendsListResponse = await runEndPoint("friends/get_friendslist/", "POST");
		console.log(friendsListResponse.message);
		
		// const length = Object.keys(friendsListResponse.friends).length;
		// console.log("Length of the dictionary:", length);
	}

	
	// async function printFriendsList(friendScroll) {
	// 	var friendsListResponse = await runEndPoint("friends/get_friendslist/", "POST");

	// 	var friendListHtml = `<a class="ms-2 align-items-center text-white" data-bs-toggle="dropdown" navlink>
	// 	<img width="30" height="30" class="rounded-circle me-3 avatarDynamic" />
	// 	<span class="mt-1 usernameDynamic section-name"></span>
	// 	</a>`;
	// 	for (var i = 0; i < 5; i++)
	// 		friendScroll.innerHTML += friendListHtml;
	// }
}