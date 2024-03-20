# Friends

## Requests

<details>
<summary>
<code>/friends/send_request</code>
</summary>
<br>
This view is responsible for sending a interaction request from one user to another. It requires the user to be logged in and the request to be made via the POST method.

### Endpoint

`POST send_request/<int:user_id>/`

### Parameters

- `user_id` (path parameter): The ID of the user to whom the interaction request is being sent.

### Request

- The request must be made using the POST method.

### Returns

#### Success

- The function returns a `200 OK` HTTP status code and a request ID if the request is successfully created.

#### Errors

- Returns a `400 error` if the request could not be created.
- Returns a `404 User not found` if the `to_user` is not found.

### <code>Request</code> notes

- `from_user` : a key to the user sending the interaction request.
- `to_user` : a key to the "target", the user receiving the interaction request.
- `status` : status of the request : `PENDING` or `ACCEPTED`.

</details>
<br>

<details>
<summary>
<code>/friends/accept_friend</code>
</summary>
<br>
This function accepts the friend request.

### Endpoint

`POST accept_friend/<int:request_id>/`

### Parameters

- `request_id` (path parameter): The ID of the request.

### Request

- The request must be made using the POST method and the user must be login.

### Returns

#### Success

- The function returns a `200 OK` HTTP status code and add the `to_user` friend to the `from_user` friends list and vice versa. Finally, the request is deleted.

#### Errors

- Returns a `400 error` if the request could not be created or if friends are already friends.
- Returns a `404 User not found` if the interaction request is not found.

### Notes

- Function uses the `is.friend` method, a method in the `Request` class that checks wether or not, `from_user` and `to_user` are friends.
- This function is decorated with `@login_required` to ensure that the user in correctly login.
- This function is decorated with `@require_http_methods(["POST"])` to ensure that it only accepts POST requests.

</details>
<br>

<details>
<summary>
<code>/friends/remove_friend</code>
</summary>
<br>
This function is designed to remove a friend from the friends list of an user.

### Endpoint

`POST remove_friend/<int:request_id>/`

### Parameters

- `request_id` (path parameter): The ID of the request.

### Request

- The request must be made using the POST method and the user must be login.

### Returns

#### Success

- The function returns a `200 OK` HTTP status code and remove the `to_user` friend to the `from_user` friends list and vice versa.

#### Errors

- Returns a `400 error` if the request could not be created or if friends are not friends.
- Returns a `404 User not found` if the interaction request is not found.

### Notes

- Function uses the `is.friend` method, a method in the `Request` class that checks wether or not, `from_user` and `to_user` are friends.
- This function is decorated with `@login_required` to ensure that the user in correctly login.
- This function is decorated with `@require_http_methods(["POST"])` to ensure that it only accepts POST requests.

</details>
<br>

<details>
<summary>
<code>/friends/get_friendslist</code>
</summary>
<br>

This function is designed to retrieve and return a list of friends for the currently logged-in user.

### Endpoint

`POST get_friendslist`

### Parameters

- `request`: The HTTP request object containing the POST data.

### Request

- The request must be made using the POST method and the user must be login.

### Returns

#### Success

- The function returns a `200 OK` HTTP status code and the friends list as dictionnary. It also returns `200`, even if user have 0 friends.

#### Errors

- Returns `404 User not found` if `request.user` does not exist.

#### Notes

- This function gets the friends list with `request.user.friends.all()` and count the number of friends with `len(friendslist)`.
- the friend list is a dictionary obtained via `[{'username': friend.username} for friend in friendslist]`.
- This function is decorated with `@login_required` to ensure that the user in correctly login.
- This function is decorated with `@require_http_methods(["POST"])` to ensure that it only accepts POST requests.