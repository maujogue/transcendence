import { getModuleDiv } from "../../Modules.js";
import { showAlert } from "../../Utils.js";
import { friendsWebsocket } from "./friendsWs.js";
import { sendFriendRequest } from "./friendsWs.js";
import { getFriendStatus } from "./friendsWs.js";
var module;

export async function init() {
	module = getModuleDiv("friendList");
	if (!module)
		return;

	friendsWebsocket();
	fillFriendsList();
	
	var searchFriendForm = module.querySelector("#searchFriendForm");
	searchFriendForm.addEventListener("submit", (event) => {
		event.preventDefault();
		searchFriend(event.target);
	});


	async function searchFriend(searchFriendForm) {
		const userData = new FormData(searchFriendForm);
		const fetchBody = {
			username: userData.get("username"),
		};
		if (!fetchBody.username)
			return showAlert("Please enter a valid username.");

		sendFriendRequest(fetchBody.username);
		getFriendStatus(fetchBody.username);
	}
}

async function fillInbox(data) {
	var requestsList = data.friend_requests;

	var inboxDiv = module.querySelector("#friendRequestInbox");
	requestsList.forEach(request => {
		var friendRequestHtml = `
		<li class="d-flex g-5">
			<a class="dropdown-item align-items-center text-white" data-bs-toggle="dropdown" navlink>
				<img width="30" height="30" class="rounded-circle me-1" src="data:image/png;base64, ${request.avatar}"/>
				<span class="mt-1"> ${request.name}</span>
			</a>
			<div class="d-flex align-items-center">
				<i class="bi bi-check-square-fill" style="color: green"></i>
				<i class="ms-2 me-3 bi bi-x-square" style="color: red"></i>
			</div>
		</li>`;
		inboxDiv.innerHTML += friendRequestHtml;
	});
}

async function printFriendslist(data) {
	var friendslist = data.friends;

	const length = Object.keys(friendslist).length;
	console.log("Length of the dictionary:", length);

	for (let step = 0; step < length; step++) {
		console.log('#', step, ': name =', friendslist[step].username, ': status =', friendslist[step].status);
	}
}

async function fillFriendsList(friendScroll) {
	var friendScroll = module.querySelector("#friendScroll");

	var friendListHtml = `<a class="ms-2 align-items-center text-white" data-bs-toggle="dropdown" navlink>
	<img width="30" height="30" class="rounded-circle me-3 avatarDynamic" />
	<span class="mt-1 usernameDynamic section-name"></span>
	</a>`;
	for (var i = 0; i < 5; i++)
		friendScroll.innerHTML += friendListHtml;
}

export { fillInbox, printFriendslist }