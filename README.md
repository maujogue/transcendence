ft_transcendence is the final project of the Common Core of 42 school.

<img width="1417" alt="Screenshot 2024-08-05 at 15 10 31" src="https://github.com/user-attachments/assets/869e9716-b5d4-4571-9dd5-8e8a40b03885">

# What is Transcendence ?
This project consists in creating a website to take part in a competition of the famous game Pong!

The aim of the project is to immerse students in a project they have no experience of. They have to learn Web development from scratch in order to successfully complete the project.

# Getting Started
- go at the root of the repository.
- type `make` in the terminal.
- Go to `https://127.0.0.1:8000` in you browser, or `https://YOUR_IP_ADDRESS:8000`
- You will need the .env for the project to work correctly.

# Features
- User authentification with e-mail confirmation
- Translations support for English, French and Spanish
- Pong video game
- Online tournaments
- 3d modeling
- Blockchain Implementation
- AI

# Frontend
This using the following stack:
- Language - [JavaScript](https://www.javascript.com/)
- Styling - [Bootstrap](https://getbootstrap.com/)

#### Modules
We implemented a module system, you can read more about it [here](frontend/js/modules/documentation.md)

This makes our code :
- more reusable
- more refactorable
- more categorized
- less prone to errors

#### Translations 
We implemented a library-free translation system, which you can learn about [here](frontend/js/modules/translationsModule/documentation.md)

It is :
- fast
- easy to update
- not very feature rich
- moderately scalable

# Backend
This using the following stack:
- Language - [Python](https://www.python.org/)
- Framework - [Django](https://www.djangoproject.com/)
- Database - [postgreSQL](https://www.postgresql.org/)
  
### 42 Authentification
You can create an account and login using a password-free authentification with your 42 account.
I will retrieve your school's profile picture, username and email.

![image](https://github.com/user-attachments/assets/b8fcca15-b888-4dd4-838d-2c330498fdbc)

# Game
The Game is a modern twist on the classic Pong, built with JavaScript and Three.js. this game offers both Quick Play and Tournament modes. Choose from 4 characters and compete to become the Pong champion!

<h3>Features</h3>
<ul>
  <li>Quick Play: Instantly find and play against another player online.</li>
  <li>8-Player Tournament: Compete tournament with 8 participants max.</li>
</ul>

<img width="200" alt="Screenshot 2024-08-05 at 15 13 50" src="https://github.com/user-attachments/assets/2b136034-3f19-4af8-bd61-340f4a597e42">
<img width="200" alt="Screenshot 2024-08-05 at 15 19 55" src="https://github.com/user-attachments/assets/2d33ebde-d1b6-4d41-884b-9c649aed3042">
<img width="200" alt="Screenshot 2024-08-05 at 15 20 32" src="https://github.com/user-attachments/assets/2bf8eef7-5669-4450-9ddf-ed9c690da435">
<img width="200" alt="Screenshot 2024-08-05 at 15 29 30" src="https://github.com/user-attachments/assets/14ffb21e-6145-4262-ab21-39f46dd4b903">


This using the following stack:
- Language - [JavaScript](https://www.javascript.com/)
- Framework - [ThreeJS](https://threejs.org/)

# Blockchain
Each time a tournament is completed, the result of each match in the tournament is sent to the blockchain.
When the transaction is complete, the "see on blockchain" button appears, allowing you to view the transaction directly and check the information (click on 'show more' then 'View input as UTF-8').

The display is difficult to read, but the order is always: "tournament name, tournament winner's name, then each match in the following order: 'player 1, player 1's score, player 2, player 2's score, match winner's name'".
<img width="1354" alt="Screenshot 2024-08-05 at 15 24 52" src="https://github.com/user-attachments/assets/82e05639-9f40-4c79-8541-1a756088bd51">

This using the following stack:
- Language of the Smart Contract - [Solidity](https://soliditylang.org/)
- Library for backend interaction - [web3.py](https://pypi.org/project/web3/)
- Blockchain - [Sepolia](https://sepolia.etherscan.io/)
- Network API - [Infura](https://www.infura.io/)

`Address of the Smart Contract: 0xD7CFDC73171139dbd48f80c23974712D4c5952AB`

# AI
[in progress]

made with @gclement42, @maujogue, @LezardSC, @boulatrousse, @MarcelCerdan
