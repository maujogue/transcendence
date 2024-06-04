#### Multilingual support

### What language are supported ?
We currently support english, french and spanish. We also plan to support italian, german, portuguese and chinese by the end of the project.

### How do I create/modify my HTML to automate translations ?

1. Put the data-lang attribute in the direct parent of the content you want to internationalise. 
import { showAlert } from '../../Utils.js';

2. Set the attribute to the english version, but simplified and with `_` replacing whitespaces

3. Go to `frontend/translations` and add your attribute to the json languages files, with the corresponding string in each language.

Done! Your HTML div will be injected with the correct language now.

### Example

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
