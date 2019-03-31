var app = require('http').createServer(appResponse);
const https = require('https');
var fs = require('fs');
var io = require('socket.io')(app);
var quotes = require('./quotes');

let sessionTimer, quoteTimer;
const maxTime = 5*60*1000;  // user is loged out after 5 minutes of inactivity
const quoteTime = 30*1000;  // a quote is setn to user after 30 sec of their inactivity
let answer, lat, long, randomQuote;

app.listen(3000);
console.log("App is running on port 3000");

function appResponse(req, res) {
	var file = "";
	if(req.url == "/"){
		file = __dirname + '/index.html';
	} else {
		file = __dirname + req.url;
	}

	fs.readFile(file,
		function (err, data) {
		if (err) {
			res.writeHead(404);
			return res.end('Page or file not found');
		}

		res.writeHead(200);
		res.end(data);
		}
	);
}

function getWeather(lat, long, callback) {
	let returnResp;
	const APIKEY = '27c76b54cfee1bad8b63eb65385b42e0';
	url = 'https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+long+'&appid='+APIKEY;
	//console.log("url:", url);

	function parseData(data, callback) {
		weatherData = JSON.parse(data);
		temp = weatherData.main.temp;
		descr = weatherData.weather[0].description;
		//console.log(weatherData);
		returnResp = JSON.parse(data).main.temp;
		callback(temp, descr);
	}

	https.get(url, (resp) => {
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			parseData(data, () => {callback(temp, descr)});
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
		returnResp = "Unfortunately, I was not able to get the weather data for you. Please ask something else.";
	});
}

function kelvinToFahrenheit(value) {
	return (kelvinToCelsius(value) * 1.8 + 32).toFixed(1);
}
function kelvinToCelsius(value) {
	return value - 273.15;
}

function resetSessionTimer(callback) {
	clearTimeout(sessionTimer);
  sessionTimer = setTimeout(function(){ 
		callback();
	}, maxTime);
}

function resetQuoteTimer(callback) {
	clearTimeout(quoteTimer);
  quoteTimer = setTimeout(function(){ 
		callback();
	}, quoteTime);
}

io.on("connection", function(socket) {
	socket.on("send message", function(question, callback) {

		console.log("Question:", question);
		resetSessionTimer(() => {
			io.sockets.emit("update", "#logOut#"); callback();
		});

		function getQuote() {
			resetQuoteTimer(() => {
				randomQuote = quotes[Math.floor(Math.random()*(quotes.length))];
				io.sockets.emit("update", "#answer:" + randomQuote); callback();
				getQuote();
			});
		}
		getQuote();

		const questionArr = question.split("#latlong:");
		answer = questionArr[0];

		if (question.includes("#username:")) {
			// User authentication needs to be added here
			io.sockets.emit("update", "#userLogedIn#"); callback();
		} else {
			io.sockets.emit("update", answer); callback();
		}
		
		if (question.toLowerCase().includes("weather")) {
			console.log("It's a weather question!");
			if (questionArr[1] !== "&") {
				const latlongArr = questionArr[1].split("&");
				lat = latlongArr[0];
				long = latlongArr[1];
				io.sockets.emit("update", "#answer:" + "I am getting weather conditions for your location…"); callback();
				getWeather(lat, long, function(temp, descr) {
					io.sockets.emit("update", "#answer:" + "Here they are: " + kelvinToFahrenheit(temp) + "F, " + descr); callback();
				});			
			} else {
				answer = "#answer:" + "It seems that you are asking about the weather. Please allow this chat to get access to the coordinates of your geographical location, resubmit you question, and I will let you know the current whether where you are.";
				io.sockets.emit("update", answer); callback();
			}
		} else if (!question.includes("#username:")) {
			randomQuote2 = quotes[Math.floor(Math.random()*(quotes.length))];
			io.sockets.emit("update", "#answer:" + randomQuote2); callback();
		}
	});
});
