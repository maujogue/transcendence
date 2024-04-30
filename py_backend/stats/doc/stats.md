## User Winrate

<details>
<summary>
<code>/\<str:user\>/winrate</code>
</summary>

### Entrypoint

`GET /\<user\>/winrate`

### Parameters

- `user`: The username for which winrate is to be calculated.

### Returns

- A JSON response containing the winrate of the specified user.

#### Success

If the request is successful, the server responds with a JSON object containing the winrate of the user and a `200 OK` HTTP status code.

#### Errors

- **User Existence Check**: It checks if the provided user exists. If the user does not exist, it returns a `404 Not Found` response with an error message.

### Notes

- This function is decorated with `@require_http_methods(["GET"])` to ensure that it only accepts GET requests.
- The winrate is calculated based on the number of matches won and lost by the user.
- If there are no matches lost, the winrate is considered as 100%.
- If there are no matches won, the winrate is considered as 0%.
- The winrate is calculated as the ratio of matches won to matches lost, multiplied by 100.
</details>

## User Matches

<details>
<summary>
<code>/\<str:user\>/matchs</code>
</summary>

### Entrypoint

`GET /\<user\>/matchs`

### Parameters

- `user`: The username for which matches are to be retrieved.

### Returns

- A JSON response containing the matches involving the specified user.

#### Success

If the request is successful, the server responds with a JSON object containing the matches involving the user and a `200 OK` HTTP status code.

#### Errors

- **User Existence Check**: It checks if the provided user exists. If the user does not exist, it returns a `404 Not Found` response with an error message.

### Notes

- This function is decorated with `@require_http_methods(["GET"])` to ensure that it only accepts GET requests.
- The matches are retrieved based on the specified user participating as either player1 or player2.
</details>

## User Win Matches

<details>
<summary>
<code>/\<str:user\>/matchs/win</code>
</summary>

### Entrypoint

`GET /\<user\>/matchs/win`

### Parameters

- `user`: The username for which winning matches are to be retrieved.

### Returns

- A JSON response containing the winning matches of the specified user.

#### Success

If the request is successful, the server responds with a JSON object containing the winning matches of the user and a `200 OK` HTTP status code.

#### Errors

- **User Existence Check**: It checks if the provided user exists. If the user does not exist, it returns a `404 Not Found` response with an error message.

### Notes

- This function is decorated with `@require_http_methods(["GET"])` to ensure that it only accepts GET requests.
- The winning matches are retrieved based on the specified user being the winner.
</details>


## User Win Streak

<details>
<summary>
<code>/\<str:user\>/matchs/win/streak</code>
</summary>

### Entrypoint

`GET /\<user\>/matchs/win/streak`

### Parameters

- `user`: The username for which the win streak is to be calculated.

### Returns

- A JSON response containing the win streak of the specified user.

#### Success

If the request is successful, the server responds with a JSON object containing the win streak of the user and a `200 OK` HTTP status code.

#### Errors

- **User Existence Check**: It checks if the provided user exists. If the user does not exist, it returns a `404 Not Found` response with an error message.

### Notes

- The win streak is calculated as the longest sequence of consecutive wins by the user.
- This function does not require the `@require_http_methods(["GET"])` decorator as it only accepts GET requests by default.
- The win streak is determined by analyzing the match history of the specified user.
</details>

## User Loose Matches

<details>
<summary>
<code>/\<str:user\>/matchs/loose</code>
</summary>

### Entrypoint

`GET /\<user\>/matchs/loose`

### Parameters

- `user`: The username for which losing matches are to be retrieved.

### Returns

- A JSON response containing the losing matches of the specified user.

#### Success

If the request is successful, the server responds with a JSON object containing the losing matches of the user and a `200 OK` HTTP status code.

#### Errors

- **User Existence Check**: It checks if the provided user exists. If the user does not exist, it returns a `404 Not Found` response with an error message.

### Notes

- This function is decorated with `@require_http_methods(["GET"])` to ensure that it only accepts GET requests.
- The losing matches are retrieved based on the specified user being the loser.
</details>

## All Matches

<details>
<summary>
<code>/matchs</code>
</summary>

### Entrypoint

`GET /matchs`

### Returns

- A JSON response containing all matches.

#### Success

If the request is successful, the server responds with a JSON object containing all matches and a `200 OK` HTTP status code.

### Notes

- This function is decorated with `@require_http_methods(["GET"])` to ensure that it only accepts GET requests.
- All matches from the database are retrieved and returned as a JSON response.
</details>
