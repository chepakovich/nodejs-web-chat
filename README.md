# Simple Automated Web Chat

## Description of the application
The web chat application is built using Node.js and WebSocket. It has a skeleton automatic reply functionality that could be significantly expanded to allow for robotic chat interactions with users (providing canned answers and the like).
When a user's post contains the word "weather", an asynchronous API call is made from the back end to openweathermap.org to get current weather conditions for the user geographical coordinates (user should allow access to his location for this app in the browser). Once the weather data is received, it is pushed to the chat UI.
For all other questions, the app just responds with a randomly-selected quote of a famous person.
In case of user inactivity, the app sends random messages to the chat UI every 30 seconds, and then logs out the user if they been inactive for the period of 5 minutes.

## Instructions on installation and running
- clone the repository
- run "npm install" command in the terminal while in the project foldeer (there is only one dependency to install - socket.io)
- run "node app.js" command in the terminal
- the app will be running on http://localhost:3000/

Here is a screenshot of the login UI:
<p align="center">
  <img src="screenshot-1.png" width="700"/>
</p>

And here is a screenshot the chat:
<p align="center">
  <img src="screenshot-2.png" width="700"/>
</p>