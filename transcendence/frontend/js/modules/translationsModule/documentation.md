#### Multilingual support

#### What language are supported ?
We currently support english, french and spanish. We also plan to support italian, german, portuguese and chinese by the end of the project.

### Frontend

#### How do I create/modify my HTML to automate translations ?

1. Put the data-lang attribute in the direct parent of the content you want to internationalise. 

2. Set the attribute to the english version, but simplified and with `_` replacing whitespaces

3. Go to `frontend/translations` and add your attribute to the json languages files, with the corresponding string in each language.

Done! Your HTML div will be injected with the correct language now.

#### Example

`Dashboard.html` file :
```
<span data-lang="welcome_message"> </span>
```
`en.json` file:
```
{
	"welcome_message": "Welcome to our website!",
	"bye_message": "See you soon!"
}
```
`fr.json` file:
```
{
	"welcome_message": "Bienvenue sur notre site!",
	"bye_message": "A bientôt!"
}
```

### For Backend Pop-ups

To print messages on the frontend (using the pop-over) from the backend without fetching, you can use the `redirect` django function that will call the `printQueryParamsMessage` on the front.

#### Usage

`redirect(url)` : the url must be composed of :

1. The page you want to go to: `/dash`/`about`/`game`/
2. The state of the message: `success=true` -> green pop-up / `success=false`-> red pop-up
3. The key of the message in the JSon files: `message=JSon_key`


#### Example

`Views.py` file:
```
   	   urlPath  -+         state -+                  JsonKey -+
		 	     |                |                           |
                 -----         ----         -------------------
return redirect('/dash?success=true&message=42_register_success')
                      |            |
        	          |            |
                      |            |
				`?`separator     `&`separator
```

`dashboard.js` file:
```
export async function init(queryParams) {
	printQueryParamsMessage(queryParams);

	...
}
```

### Done!

Your message will be injected/pop-over, in whatever language the user has chosen!