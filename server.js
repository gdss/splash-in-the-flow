const WebSocket = require('ws');
var mqtt = require('mqtt');

var client  = mqtt.connect('mqtt://test.mosquitto.org');
var topics = [];

client.on('connect', function () {

});

client.on('message', function (topic, message) {
 // message is Buffer 
 wss.clients.forEach(function each(c) {
		if (c.readyState === WebSocket.OPEN) {
			c.send("mqtt;" + topic + ";" + c.login + ": " + message.toString());
		}
	});
});

const wss = new WebSocket.Server({ port: 3000, path: '/splash' });

wss.on('connection', function(ws) {
  ws.on('message', function(message) {

  	if (message.includes('sitf-subscribe')) {
  		var protocol = message.split(";");
  		client.subscribe(protocol[1]);
  		var topic = protocol[1].substring(5);
  		if (!topics.includes(topic)) {
  			topics.push(topic);
 
  			 wss.clients.forEach(function each(c) {
				if (c.readyState === WebSocket.OPEN) {
					c.send('sitf-topics-return;' + topics);
				}
			});
  		}
  		 wss.clients.forEach(function each(c) {
			if (c.readyState === WebSocket.OPEN) {
				c.send("mqtt;" + topic + ";" + ws.login + " entrou na sala");
			}
		});
  	} else if (message.includes('sitf-publish')) {
  		var protocol = message.split(";");
  		client.publish(protocol[1], protocol[2]);
  	} else if (message.includes('sitf-topics')) {
  		ws.send('sitf-topics-return;' + topics);
  	} else if (message.includes('sitf-login')) {
  		ws['login'] = message.split(";")[1];
  		ws.send('sitf-login-return');
  	}

    console.log('received: %s', message);
  });

  console.log('new connection');
});