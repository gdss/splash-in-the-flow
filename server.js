const WebSocket = require('ws');
var mqtt = require('mqtt');

var client  = mqtt.connect('mqtt://test.mosquitto.org');
var topics = {};
var logins = [];

client.on('connect', function () {

});

client.on('message', function (topic, message) {
 // message is Buffer 
 wss.clients.forEach(function each(c) {
		if (c.readyState === WebSocket.OPEN) {
			c.send("mqtt;" + topic + ";" + message.toString());
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

  		if (Object.keys(topics).includes(topic)) {
  			topics[topic] += 1;
  		} else {
  			topics[topic] = 1;
  			attTopics();
  		}
  		console.log('o topico ' + topic + ' tem ' + topics[topic]);
  	} else if (message.includes('sitf-publish')) {
  		var protocol = message.split(";");
  		client.publish(protocol[1], protocol[2]);
  	} else if (message.includes('sitf-topics')) {
  		ws.send('sitf-topics-return;' + Object.keys(topics));
  	} else if (message.includes('sitf-login')) {
  		var login = message.split(";")[1];
  		if (!logins.includes(login) && login != '') {
  			logins.push(login);
  			ws.send('sitf-login-sucess');
  		} else {
  			ws.send('sitf-login-failure');
  		}
  	} else if (message.includes('sitf-exit-subscribe')) {
  		var topic = message.split(";")[1].substring(5);
  		topics[topic] -= 1;
  		console.log('o topico ' + topic + ' tem ' + topics[topic]);
  		if (topics[topic] <= 0) {
  			delete topics[topic];
  			attTopics();
  		}
  	}

    console.log('received: %s', message);
  });

  console.log('new connection');
});

function attTopics() {
	wss.clients.forEach(function each(c) {
		if (c.readyState === WebSocket.OPEN) {
			c.send('sitf-topics-return;' + Object.keys(topics));
		}
	});
}