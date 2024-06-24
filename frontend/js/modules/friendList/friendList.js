import { getModuleDiv } from "../../Modules.js";
import { isLoggedIn, showAlert } from "../../Utils.js";
import { friendsWebsocket } from "./friendsWs.js";
import { sendFriendRequest } from "./friendsWs.js";
import { acceptFriendRequest, declineFriendRequest} from "./friendsWs.js";

var module;

export async function init() {
	module = getModuleDiv("friendList");
	if (!module)
		return;

	if (await isLoggedIn())
		friendsWebsocket();

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
	}
}

async function fillInbox(data) {
	var requestsList = data.friend_requests;
	var inboxDiv = module.querySelector("#friendRequestInbox");
	var length = 0;

	inboxDiv.innerHTML = "";
	requestsList.forEach(request => {
		if(length++ > 10)
		{
			if (!inboxDiv.querySelector(".finish"))
				inboxDiv.innerHTML += `<div class="finish mx-auto">...</div>`;
			return ;
		}
		var friendRequestHtml = `
		<li class="d-flex g-5">
			<a class="dropdown-item align-items-center text-white" navlink>
				<img width="30" height="30" class="rounded-circle me-1" src="data:image/png;base64, ${request.avatar}"/>
				<span class="mt-1">${request.name}</span>
			</a>
			<div class="d-flex align-items-center">
				<i class="bi bi-check-square-fill accept-request" style="color: green"></i>
				<i class="ms-2 me-3 bi bi-x-square decline-request" style="color: red"></i>
			</div>
		</li>`;
		inboxDiv.innerHTML += friendRequestHtml;
	});
	module.querySelectorAll(".accept-request").forEach(acceptButton => {
		acceptButton.addEventListener("click", (e) => {
			var fromUser = acceptButton.closest("li").querySelector("span").innerText;
			acceptFriendRequest(fromUser);
			e.stopPropagation();
		});
	});
	module.querySelectorAll(".decline-request").forEach(declineButton => {
		declineButton.addEventListener("click", (e) => {
			var fromUser = declineButton.closest("li").querySelector("span").innerText;
			declineFriendRequest(fromUser);
			e.stopPropagation();
		});
	});
}

async function fillFriendsList(data) {
	console.log('data = ', data);
	var friendList = data.friends;
	var friendScroll = module.querySelector("#friendScroll");

	friendScroll.innerHTML = "";
	friendList.forEach(friend => {
		var friendListHtml = `<a class="ms-2 align-items-center text-white" data-bs-toggle="dropdown" navlink>
		<img width="30" height="30" class="rounded-circle me-3"  src="data:image/png;base64, ${friend.avatar}"/>
		<span class="mt-1 section-name">${friend.username}</span>
		</a>`;
		friendScroll.innerHTML += friendListHtml;
	});
}

export { fillInbox, fillFriendsList }