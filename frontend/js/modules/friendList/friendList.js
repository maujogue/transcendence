import { getModuleDiv } from "../../Modules.js";
import { isLoggedIn, showAlert } from "../../Utils.js";
import { friendsWebsocket } from "./friendsWs.js";
import { sendFriendRequest } from "./friendsWs.js";
import { acceptFriendRequest, declineFriendRequest } from "./friendsWs.js";
import { updateModule } from "../../Modules.js";
import { injectUserData } from "../../User.js";
import { checkUserExist } from "./friendsWs.js";

var module;
var friendList;
var userExists;

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

		displayUserPage(fetchBody.username);
		sendFriendRequest(fetchBody.username);
		// getFriendStatus(fetchBody.username);
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
			return;
		}
		var friendRequestHtml = `
		<li class="d-flex g-5">
			<a class="userLink dropdown-item align-items-center text-white" navlink>
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
	module.querySelectorAll(".userLink").forEach(userLink => {
		userLink.addEventListener("click", (e) => {
			var fromUser = userLink.closest("li").querySelector("span").innerText;
			displayUserPage(fromUser);
		});
	});
}

async function fillFriendsList(data) {
	friendList = data.friends;
	var friendScroll = module.querySelector("#friendScroll");

	friendScroll.innerHTML = "";
	friendList.forEach(friend => {
		var friendListHtml = `
		<li class="d-flex g-5">
			<a class="userLink ms-2 align-items-center text-white" data-bs-toggle="dropdown" navlink>
			<img width="30" height="30" class="rounded-circle me-3"  src="data:image/png;base64, ${friend.avatar}"/>
			<span class="mt-1 section-name">${friend.username}</span>
			</a>
		</li>`;
		friendScroll.innerHTML += friendListHtml;
	});
}

function setUserExist(data) {
	userExists = data.exists;
}

async function displayUserPage(username) {
	var userDash = document.getElementById("userDash");
	userDash.style.transition = "opacity 0.5s";
	userDash.style.opacity = 0;

	await checkUserExist(username);
	console.log("userExists = ", userExists);
	if(userExists === false)
		return showAlert("This user does not exist.");
	setTimeout(() => {
		userDash.querySelector("#closeProfileBtn").innerHTML = `
		<button id='closeUserDash' class='btn btn-warning mb-3 top-0 end-100 d-flex align-items-center justify-content-center'>
			<i class="pt-1 fa-solid fa-arrow-left text-white h5"></i>
			<span class="pt-1 ms-2 text-white h5"> Back</span>
		</button>
		`;
		var editBtn = userDash.querySelector("#editProfileBtn");
		editBtn.hidden = true;
		var manageFriendshipBtn = userDash.querySelector("#manageFriendshipBtn");
		console.log("friendlist = ", friendList);
		var friend = friendList.find(friend => friend.username === username);
		if (friend)
			manageFriendshipBtn.innerHTML = `
			<button class="btn btn-danger" id="unfriendBtn">Unfriend</button>
			`;
		else
			manageFriendshipBtn.innerHTML = `
			<button class="btn btn-outline-success " id="addFriendBtn">Add Friend</button>
			`;
		manageFriendshipBtn.addEventListener("click", () => {
			if (friend) {
				// removeFriend(username);
			}
			else{
				sendFriendRequest(username);
				manageFriendshipBtn.querySelector("button").classList.add("btn-success");
				manageFriendshipBtn.querySelector("button").classList.add("text-white");
				manageFriendshipBtn.querySelector("button").innerHTML = "Friend Request Sent";
				setTimeout(() => {
					manageFriendshipBtn.querySelector("button").classList.remove("btn-success");
					manageFriendshipBtn.querySelector("button").classList.remove("text-white");
					manageFriendshipBtn.querySelector("button").innerHTML = "Add Friend";
				}, 2000);
			}
		});
		manageFriendshipBtn.hidden = false;

		var closeBtn = userDash.querySelector("#closeUserDash");
		closeBtn.addEventListener("click", async () => {
			userDash.style.opacity = 0;
			await showUserDash(null, closeBtn);
		});
	}, 500);
	showUserDash(username);
}

async function showUserDash(username, closeBtn) {
	setTimeout(async () => {
		if (closeBtn)
			closeBtn.remove();
		await injectUserData(userDash, username);
		await updateModule("statisticsModule")
		setTimeout(() => {
			userDash.style.opacity = 1;
		}, 200);
	}, 500);
}

export { fillInbox, fillFriendsList, displayUserPage, setUserExist}