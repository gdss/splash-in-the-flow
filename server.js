const WebSocket = require('ws');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const wss = new WebSocket.Server({ port: 3000, path: '/room' });

var users = [];

wss.on('connection', function(ws) {
	
	ws.on('message', function(message) {
		console.log('Msg received in server: %s ', message);
		// Broadcast to everyone else.
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
		
	});

	console.log('new connection');
});

function User(name) {
	this.name = name;
}

app.get('/discussions', function (req, res) {
	res.sendFile( __dirname + "/" + "login.html" );
})

app.post('/discussions', urlencodedParser, function (req, res) {
	console.log(req.body.nickname);
	res.sendFile( __dirname + "/" + "discussions.html" );
})

var server = app.listen(8081, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
})