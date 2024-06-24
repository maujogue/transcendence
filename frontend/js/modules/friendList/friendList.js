import { getModuleDiv } from "../../Modules.js";
import { isLoggedIn, showAlert } from "../../Utils.js";
import { friendsWebsocket } from "./friendsWs.js";
import { sendFriendRequest } from "./friendsWs.js";
import { acceptFriendRequest, declineFriendRequest } from "./friendsWs.js";
import { updateModule } from "../../Modules.js";
import { getUserData, injectUserData } from "../../User.js";
import { checkUserExist } from "./friendsWs.js";
import { removeFriend } from "./friendsWs.js";
import { injectTranslations } from "../translationsModule/translationsModule.js";
import { checkInputAvailable } from "../../ApiCalls.js";
var module;
var friendList;

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

		await displayUserPage(fetchBody.username);
	}
}

async function fillInbox(data) {
	var requestsList = data.friend_requests;
	var inboxDiv = module.querySelector("#friendRequestInbox");
	var length = 0;

	inboxDiv.innerHTML = "";
	if (requestsList.length === 0)
		inboxDiv.innerHTML = `<div class="mx-auto px-2" data-lang="no_friend_request"></div>`;
	requestsList.forEach(request => {
		if (length++ > 10) {
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
		userLink.addEventListener("click", async (e) => {
			var fromUser = userLink.closest("li").querySelector("span").innerText.trim();
			await displayUserPage(fromUser);
		});
	});
}

async function fillFriendsList(data) {
	friendList = data.friends;
	const onlineFriends = friendList.filter(friend => friend.status);
	const offlineFriends = friendList.filter(friend => !friend.status);
	var friendScroll = module.querySelector("#friendScroll");
	friendScroll.innerHTML = "";

	var friendListHtml = (friend, isOnline) => {
		return `
        <li class="d-flex g-5" ${!isOnline ? 'style="opacity:0.5;"' : ''}>
            <a class="userLink ms-2 align-items-center text-white" navlink>
                <img width="30" height="30" class="rounded-circle me-3" src="data:image/png;base64, ${friend.avatar}"/>
                <span class="mt-1 section-name">${friend.username}
                ${isOnline ? '<i class="ms-2 bi bi-circle-fill" style="color:green;"></i>' : ''}
				</span>
            </a>
        </li>`;
	}
	onlineFriends.forEach(friend => {
		friendScroll.innerHTML += friendListHtml(friend, true);
	});
	offlineFriends.forEach(friend => {
		friendScroll.innerHTML += friendListHtml(friend, false);
	});
	await refreshManageFriendshipBtn();
}

async function refreshManageFriendshipBtn() {
	var dashUser = userDash.querySelector(".usernameDynamic").innerText;
	initManageFriendshipBtn(dashUser);
}

async function displayUserPage(username) {
	var userExists = await checkInputAvailable(username, "username");
	if (userExists)
		return showAlert("This user does not exist.");
	if (username === await getUserData("username"))
		return showAlert("You cannot visit your own profile.");
	await waitThenInitDashButtons(username);
	await injectDashData(username);
}

async function injectDashData(username, close) {
	var userDash = document.getElementById("userDash");
	setTimeout(async () => {
		if (close) {
			showDiv("#closeProfileBtn", false);
			showDiv("#manageFriendshipBtn", false);
			showDiv("#editProfileBtn", true);
		}
		await injectUserData(userDash, username);
		await updateModule("statisticsModule")
		setTimeout(() => {
			userDash.style.opacity = 1;
		}, 200);
	}, 500);
}

async function waitThenInitDashButtons(username) {
	var userDash = document.getElementById("userDash");
	userDash.style.opacity = 0;

	setTimeout(async () => {
		showDiv("#closeProfileBtn", true);
		showDiv("#editProfileBtn", false);
		showDiv("#manageFriendshipBtn", true);
		await initManageFriendshipBtn(username);
		initCloseButton();
	}, 500);
}

function initCloseButton() {
	var closeBtn = userDash.querySelector("#closeProfileBtn");
	closeBtn.addEventListener("click", async () => {
		userDash.style.opacity = 0;
		await injectDashData(null, true);
	});
}

function initManageFriendshipBtn(username) {
	var manageFriendshipBtn = userDash.querySelector("#manageFriendshipBtn");

	var friend = friendList.find(friend => friend.username === username);
	if (friend)
		manageFriendshipBtn.innerHTML = `<button class="btn btn-danger" disabled data-lang="unfriend">Unfriend</button>`;
	else
		manageFriendshipBtn.innerHTML = `<button class="btn btn-outline-success " disabled data-lang="add_friend">Add Friend</button>`;

	injectTranslations();
	var btn = manageFriendshipBtn.querySelector("button");
	btn.addEventListener("click", () => {
		if (friend) {
			removeFriend(username);
			btn.remove();
			initManageFriendshipBtn(username);
		}
		else {
			sendFriendRequest(username);
			btn.classList.add("btn-success");
			btn.classList.add("text-white");
			btn.innerHTML = "<span data-lang='friend_request_sent'></span>";
			injectTranslations();
			setTimeout(() => {
				btn.classList.remove("btn-success");
				btn.classList.remove("text-white");
				btn.innerHTML = "<span data-lang='add_friend'></span>";
				injectTranslations();
			}, 2000);
		}
	});
	btn.disabled = false;
}

function showDiv(btnSelector, show) {
	var btn = userDash.querySelector(btnSelector);
	btn.hidden = !show;
}

export { fillInbox, fillFriendsList, displayUserPage }