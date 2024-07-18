import { getModuleDiv } from "../../Modules.js";
import { asyncTimeout, disableCollapsedSidebar, isLoggedIn, showAlert } from "../../Utils.js";
import { friendsWebsocket, getUserRequests } from "./friendsWs.js";
import { sendFriendRequest } from "./friendsWs.js";
import { acceptFriendRequest, declineFriendRequest } from "./friendsWs.js";
import { updateModule } from "../../Modules.js";
import { getUserData, injectUserData } from "../../User.js";
import { removeFriend } from "./friendsWs.js";
import { injectTranslations } from "../translationsModule/translationsModule.js";
import { checkInputAvailable } from "../../ApiCalls.js";
import { navigateTo } from "../../Router.js";
var module;
var friendList;
var requestsList;

export async function init() {
	module = getModuleDiv("friendList");
	if (!module)
		return;

	if (await isLoggedIn())
		friendsWebsocket();

	var friendsNavbarBtns = module.querySelectorAll(".friendsNavbarBtn");
	friendsNavbarBtns.forEach(btn => {
		btn.addEventListener("click", async () => {
			disableCollapsedSidebar(true);
		});
	});
	var searchFriendForm = module.querySelector("#searchFriendForm");
	searchFriendForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		var input = searchFriendForm.querySelector("input");
		if (input.hidden == true) {
			disableCollapsedSidebar(true);
			setTimeout(() => {
				input.focus();
				input.setSelectionRange(input.value.length, input.value.length); // Place cursor at the end
			}, 800);
		}
		else if (input.value === "") {
			input.focus();
			input.setSelectionRange(input.value.length, input.value.length); // Place cursor at the end
		}
		else
			await searchFriend(event.target);
	});


	async function searchFriend(searchFriendForm) {
		const userData = new FormData(searchFriendForm);
		const fetchBody = {
			username: userData.get("username"),
		};
		if (!fetchBody.username)
			return showAlert("enter_valid_username_message");

		await displayUserPage(fetchBody.username);
	}
}

async function fillInbox(data) {
	requestsList = data.friend_requests;
	var inboxDiv = document.querySelector("#friendRequestInbox");
	var notifBadge = document.querySelector("#notificationsBadge");
	var length = 0;

	inboxDiv.innerHTML = "";
	if (requestsList.length === 0) {
		notifBadge.click();
		notifBadge.parentNode.setAttribute("data-bs-toggle", "none");
		notifBadge.parentNode.style.cursor = "default";
	}
	else {
		notifBadge.parentNode.setAttribute("data-bs-toggle", "dropdown");
		notifBadge.parentNode.style.cursor = "pointer";
	}
	notifBadge.innerHTML = `<i class="bi bi-${requestsList.length}-circle-fill" ${requestsList.length > 0 ? 'style="color:green;"' : ''}></i>`
	requestsList.forEach(request => {
		if (length++ > 10) {
			if (!inboxDiv.querySelector(".finish"))
				inboxDiv.innerHTML += `<div class="finish mx-auto">...</div>`;
			return;
		}
		var friendRequestHtml = `
		<li class="d-flex g-5">
			<a class="userLink dropdown-item align-items-center text-white">
				<img width="30" height="30" class="rounded-circle me-1" src="data:image/png;base64, ${request.avatar}"/>
				<span class="mt-1 request-name">${request.name}</span>
			</a>
			<div class="d-flex align-items-center">
				<i class="fa-solid fa-check fa-lg accept-request" style="color: green;"></i>
				<i class="ms-2 me-3 bi bi-x-lg decline-request" style="color: red;"></i>
			</div>
		</li>
		<style>
		.accept-request, .decline-request {
			cursor: pointer;
			transition: font-size 0.2s;
		}
		.accept-request:hover, .decline-request:hover {
			font-size: 25px;
		}
		.accept-request:hover{
			font-size: 32px;
		}
		.accept-request{
			font-size: 20px;
		}
		</style>`;
		inboxDiv.innerHTML += friendRequestHtml;
	});
	inboxDiv.querySelectorAll(".accept-request").forEach(acceptButton => {
		acceptButton.addEventListener("click", (e) => {
			var fromUser = acceptButton.closest("li").querySelector("span").innerText;
			acceptFriendRequest(fromUser);
			e.stopPropagation();
		});
	});
	inboxDiv.querySelectorAll(".decline-request").forEach(declineButton => {
		declineButton.addEventListener("click", (e) => {
			var fromUser = declineButton.closest("li").querySelector("span").innerText;
			declineFriendRequest(fromUser);
			e.stopPropagation();
		});
	});
	inboxDiv.querySelectorAll(".userLink").forEach(userLink => {
		userLink.addEventListener("click", async () => {
			var fromUser = userLink.querySelector(".request-name").innerText.trim();
			await displayUserPage(fromUser);
		});
	});
}

function sortFriendsName(x, y) {
	return x.username.localeCompare(y.username);
}

async function fillFriendsList(data) {
	friendList = data.friends;
	const onlineFriends = friendList.filter(friend => friend.status).sort(sortFriendsName);
	const offlineFriends = friendList.filter(friend => !friend.status).sort(sortFriendsName);
	var friendScroll = module.querySelector("#friendScroll");
	friendScroll.innerHTML = "";

	var friendListHtml = (friend, isOnline) => {
		return `
		<a class="ms-2 userLink py-1 position-relative" ${!isOnline ? 'style="opacity:0.5;"' : ''}>
			<img width="30" height="30" class="rounded-circle" src="data:image/png;base64, ${friend.avatar}"/>
			${isOnline ? '<i class="bi bi-circle-fill"></i>' : ''}
			<span class="ms-2 mt-1 section-name text-white">${friend.username}</span>
		</a>
		<style>
		.userLink:hover {
			cursor: pointer;
			background-color: rgba(255, 255, 255, 0.1);
		}
		.bi-circle-fill {
			font-size: 10px;
			color: green;
			position: absolute;
			top: 0;
			left: 0;
			transform: translateX(-2px);
		}
		</style>`;
	}
	onlineFriends.forEach(friend => {
		friendScroll.innerHTML += friendListHtml(friend, true);
	});
	offlineFriends.forEach(friend => {
		friendScroll.innerHTML += friendListHtml(friend, false);
	});
	await refreshManageFriendshipBtn();
	module.querySelectorAll(".userLink").forEach(userLink => {
		userLink.addEventListener("click", async () => {
			var fromUser = userLink.querySelector(".section-name").innerText.trim();
			await displayUserPage(fromUser);
		});
	});
}

async function refreshManageFriendshipBtn() {
	var dashUser = userDash.querySelector(".usernameDynamic").innerText;
	initManageFriendshipBtn(dashUser);
}

async function displayUserPage(username) {
	var usernameAvailable = await checkInputAvailable(username, "username");
	if (usernameAvailable === true)
		return showAlert("user_not_exist_message");
	if (username === await getUserData("username"))
		return showAlert("cant_visit_own_profile_message");
	await waitThenInitDashButtons(username);
	await injectDashData(username);
	await navigateTo("/dash");
}

async function injectDashData(username, close) {
	var userDash = document.getElementById("userDash");
	setTimeout(async () => {
		if (close) {
			showDiv("#onProfileButtonsDiv", false);
			showDiv("#editProfileBtn", true);
		}
		await injectUserData(userDash, username);
		await updateModule("statisticsModule")
		setTimeout(() => {
			userDash.style.opacity = 1;
		}, 50);
	}, 100);
}

async function waitThenInitDashButtons(username) {
	var userDash = document.getElementById("userDash");
	userDash.style.opacity = 0;

	setTimeout(async () => {
		showDiv("#onProfileButtonsDiv", true);
		showDiv("#editProfileBtn", false);
		initManageFriendshipBtn(username);
		initCloseButton();
	}, 100);
}

function initCloseButton() {
	var closeBtn = userDash.querySelector("#closeProfileBtn");
	closeBtn.addEventListener("click", async () => {
		userDash.style.opacity = 0;
		await injectDashData(null, true);
	});
}

async function initManageFriendshipBtn(username) {
	var currentUser = await getUserData("username");
	var manageFriendshipBtn = userDash.querySelector("#manageFriendshipBtn");
	var requestSent;

	var friend = friendList.find(friend => friend.username === username);
	if (username && username !== currentUser) {
		getUserRequests(username);
		await asyncTimeout(100);
		requestSent = requestsList.find(request => request.name === currentUser);
	}
	if (friend)
		manageFriendshipBtn.innerHTML = `<button class="btn btn-danger" data-lang="unfriend">Unfriend</button>`;
	else if (requestSent)
		manageFriendshipBtn.innerHTML = `<button class="btn btn-danger " disabled data-lang="friend_request_sent"></button>`;
	else
		manageFriendshipBtn.innerHTML = `<button class="btn btn-success " data-lang="add_friend">Add Friend</button>`;
	injectTranslations();
	var btn = manageFriendshipBtn.querySelector("button");
	btn.addEventListener("click", () => {
		if (friend) {
			removeFriend(username);
			btn.remove();
			initManageFriendshipBtn(username);
		}
		else if (!requestSent) {
			sendFriendRequest(username);
			manageFriendshipBtn.innerHTML = `<button class="btn btn-danger " disabled data-lang="friend_request_sent"></button>`;
			injectTranslations();
		}
	});
}

function showDiv(btnSelector, show) {
	var btn = userDash.querySelector(btnSelector);
	btn.hidden = !show;
}

function initUserRequests(data) {
	requestsList = data.friend_requests;
}

export { fillInbox, fillFriendsList, displayUserPage, initUserRequests }