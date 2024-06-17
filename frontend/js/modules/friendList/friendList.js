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

	const currentUser = await getUserData('username');	
	
	var friendScroll = module.querySelector("#friendScroll");
	var searchFriendForm = module.querySelector("#searchFriendForm");
	searchFriendForm.addEventListener("submit", (event) => {
		printFriendsList();
		event.preventDefault();
		searchFriend(event.target);
		getInteractionRequests();
	});
	
	
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
			'from_user': currentUser,
			'to_user': username,
		}
		sendFriendsWebSocketMessage(message);
	}

	async function printFriendsList() {
		let message = {
			'type': 'get_friendslist',
			'current_user': currentUser,
		}
		sendFriendsWebSocketMessage(message);
	}

	async function getInteractionRequests() {
		let message = {
			'type': 'get_requests',
			'from_user': currentUser,
			'send': 'true',
		}
		sendFriendsWebSocketMessage(message);
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