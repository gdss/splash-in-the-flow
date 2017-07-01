const WebSocket = require('ws');
var mqtt = require('mqtt')

var client  = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
 
})

client.on('message', function (topic, message) {
 // message is Buffer 
 wss.clients.forEach(function each(c) {
		if (c.readyState === WebSocket.OPEN) {
			c.send("mqtt;" + topic + ";" + message.toString());
		}
	});
 console.log()
})

const wss = new WebSocket.Server({ port: 3000, path: '/splash' });

wss.on('connection', function(ws) {
  ws.on('message', function(message) {

  	if (message.includes('sitf-subscribe')) {
  		var protocol = message.split(";");
  		client.subscribe(protocol[1]);
  	} else if (message.includes('sitf-publish')) {
  		var protocol = message.split(";");
  		client.publish(protocol[1], protocol[2]);
  	}

    console.log('received: %s', message);
  });

  console.log('new connection');
});