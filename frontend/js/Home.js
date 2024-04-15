import { register, login } from "./ApiCalls.js";

var registerForm = document.getElementById('registrationForm');
registerForm.addEventListener('submit', (event) => register(event, registerForm));

var loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (event) => login(event, loginForm));