### Please Welcome modules !
Modules, inspired by React, are parts that are reused through the project and that would involve a lot of code duplication if not made through modules. How do they work ? 
Create standalone HTML and JS files. The module router will be called and it will create a duplicate element then inject it into your parent HTML file, then call the JS functions that animate it.
To prevent conflicts, mostly with querySelectors, each duplicate is given a unique ID.
Modules encourage code **reusability**, **readability**, facilitates **refactoring** and **reduces errors** when copy pasting.

#### Let's build one 

1. Create the `exampleModule.js` and `exampleModule.html` files in the `frontend/js/modules` folder. 
2. Create an `init` function inside your `exampleModule.js`, it will contain all your module's code.  Use the `getModuleDiv("exampleModule");` inside it to give a unique ID to your module. It returns the HTML div that you will need to call all your querySelectors on.
3. Link the init function to the HTML file. At this point, your `exampleModule.html` file should look like this : 
```
<div>
	This is my example
	<span class="red" style="color: red"> module </span>
	!
</div>

<script type="module">
	import { init } from "/js/modules/exampleModule.js";
	init();
</script>
```
and your `exampleModule.js` file :
```
function init () {
	var module = getModuleDiv("exampleModule");

	var textDiv = module.querySelector(".red");
	textToGreen(textDiv);

	function textToGreen(textDiv) {
		textDiv.styles.color = "green";
	}
```
5. Go into your `index.html` file and put an empty div with the class "exampleModule"
`<div class="exampleModule"></div>`
Your module's code will be injected into that div.
6. Call the `injectModule('exampleModule', divID);` in your `index.js` file, where divID is the ID of a div parent to your module's div. This can be the ID of your div, or the parent, or the section. 
(Please note that multiple modules injected with the same parent divID will conflict, if you want to put multiple, put some ids on it)
7. Finally, add the route to your module's html into the `frontend/js/Modules.js` file, like this :
```
const modules = [
	new Module("exampleModule", "js/modules/exampleModule.html"),
	new Module("exampleModule2", "js/modules/exampleModule2.html"),
	new Module("exampleModule3", "js/modules/exampleModule3.html"),
];
```
#### Good job!
 Your module should now execute properly, and you can deploy it wherever you want in your project without duplicating a lot of code. 