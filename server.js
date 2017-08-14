const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

// heroku will set an env PORT value
const PORT = process.env.PORT || 3000;

// set to true to route traffic to maintenance page
const MAINTENANCE = false;

var app = express();

// partials are blocks of very reusable html/hbs code
hbs.registerPartials(__dirname + '/views/partials');

// helpers are essentially used the same way as the variables
// but they execute a function
hbs.registerHelper('getCurrentYear', () => {
	return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
	return text.toUpperCase();
});

// set templating engine to handlebars
app.set('view engine', 'hbs');

// using middleware to add functionality
// NEED next(), this all runs before app renders
app.use((req, res, next) => {
	var now = new Date().toString();
	var log = `${now}: ${req.method} ${req.url}`;
	console.log(log);
	fs.appendFile('server.log', log + '\n', (err) => {
		if (err) {
			console.log('Unable to append to server.log');
		}
	});
	next();
});

if (MAINTENANCE) {
	//interrupt site and render maintenance page
	app.use((req, res, next) => {
		res.send('<h1 style="text-align:center; padding-top:10%;">Sorry!</h1> <h2 style="text-align:center">Site is down for maintenance. We\'ll be back up soon!</h2>');
	});
}

// using a static directory instead of handlers
app.use(express.static(__dirname + '/static'));

// handlers galore!
app.get('/', (req, res) => {
	res.render('home.hbs', {
		aboutActive: '',
		gameInfoActive: ''
	});
});

app.get('/about', (req, res) => {
	res.render('about.hbs', {
		aboutActive: 'active',
		gameInfoActive: '',
		gameProcessActive: ''
	});
});

app.get('/game', (req, res) => {
	res.render('game.hbs', {
		aboutActive: '',
		gameInfoActive: '',
		gameProcessActive: ''
	});
});

app.get('/gameInfo', (req, res) => {
	res.render('gameInfo.hbs', {
		aboutActive: '',
		gameInfoActive: 'active',
		gameProcessActive: ''
	});
});

app.get('/gameProcess', (req, res) => {
	res.render('gameProcess.hbs', {
		aboutActive: '',
		gameInfoActive: '',
		gameProcessActive: 'active'
	});
});

// app.get('/bad', (req, res) => {
// 	res.send({
// 		errorMsg: 'ERROR: Unable to handle request'
// 	});
// });

app.listen(PORT, () => {
	console.log(`Server is up on port ${PORT}`);
});
