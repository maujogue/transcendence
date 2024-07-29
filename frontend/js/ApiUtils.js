import { resetForm, toggleModal, inputInitListeners } from "./DashboardUtils.js";
import { showAlert } from "./Utils.js";
import { injectUserData } from "./User.js";
import { hostname, navigateTo } from "./Router.js";
import { setLoading } from "./Router.js";

async function get_csrf_token() {
	return fetch(`https://${hostname}:8000/api/users/get_csrf_token/`, {
		method: "GET",
		credentials: "include",
	})
		.then((response) => response.json())
		.then((data) => data.csrfToken)
		.catch((error) => {
			console.error("get csrf token fail", error);
		});
}

async function runEndPoint(endpoint, method, fetchBody) {
	return fetch(`https://${hostname}:8000/api/` + endpoint, {
		method: method,
		headers: {
			"X-CSRFToken": await get_csrf_token(),
			Accept: "application/json",
		},
		credentials: "include",
		body: fetchBody,
	})
		.then((response) => {
			if (response.statusCode == 200)
				return response.json().then((data) => {
					return { statusCode: response.status, data };
				});
			else
				throw response.statusText;
		})
		.catch((error) => {
			console.error("Authentification failed", error);
			navigateTo("/serviceDown");
			document.querySelector("#errorMessage").textContent = error;
			setLoading(false);
			document.getElementById("sidebar-container").hidden = true;
			return error;
		});
}

async function updateInfo(endpoint, fetchBody, modalToDismiss) {
	if (isSpamming(endpoint))
		return;
	var response = await runEndPoint(endpoint, "POST", fetchBody);
	var data = response.data;

	if (response.statusCode === 200) {
		showAlert(data.status, true);
		toggleModal(modalToDismiss);
		toggleModal("updateProfileModal");
		inputInitListeners();
		resetForm();
		injectUserData();
	} else if (data.error && data.error.length > 0) showAlert(data.error);
	else showAlert("profile_update_error_message");
	return response;
}

let endpointTab = {};

function isSpamming(endpoint) {
	if (endpoint in endpointTab) {
		var lastCalled = endpointTab[endpoint];
		if (Date.now() - lastCalled <= 1000){
			return true;
		}
		else {
			endpointTab[endpoint] = Date.now();
			return false
		}
	}
	else
		endpointTab[endpoint] = Date.now();
	return false
}

export { get_csrf_token, runEndPoint, updateInfo, isSpamming }