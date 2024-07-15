### Please Welcome modules !
Modules, inspired by React, are parts that are reused through the project and that would involve a lot of code duplication if not made through modules. How do they work ? 

Create standalone HTML and JS files. The module router will be called and it will create a duplicate element then inject it into your parent HTML file, then call the JS functions that animate it.

To prevent conflicts, mostly with querySelectors, each duplicate is given a unique ID.
Modules encourage code **reusability**, **readability**, facilitates **refactoring** and **reduces errors** when copy pasting.

#### Let's build one 

1. Create the `exampleModule.js` and `exampleModule.html` files in the `frontend/js/modules` folder. 
2. Create an `init` function inside your `exampleModule.js`, it will contain all your module's code.  Use the `getModuleDiv("exampleModule");` inside it to give a unique ID to your module. It returns the HTML div that you will need to call all your querySelectors on.
At this point, your `exampleModule.html` file should look like this : 
```
<div>
	This is my example
	<span class="green"> module </span>
	!
</div>
```
and your `exampleModule.js` file :
```
import { getModuleDiv } from "../../Modules.js";

export function init () {
	var module = getModuleDiv("exampleModule");
	if (!module)
		return ;

	var textDiv = module.querySelector(".green");
	textToGreen(textDiv);

	function textToGreen(textDiv) {
		textDiv.styles.color = "green";
	}
```
3. Put the class attribute `class="exampleModule"` in any div you want your module to be injected in
4. Finally, add the route to your module's html into the `frontend/js/Modules.js` file, like this :
```
const modules = [
	new Module("exampleModule"),
	new Module("exampleModule2"),
];
```
### Good job!

#### Your module should now execute properly, and you can deploy it wherever you want in your project without duplicating a lot of code. 