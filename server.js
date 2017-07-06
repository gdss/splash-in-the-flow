const WebSocket = require('ws');
var mqtt = require('mqtt');

var client  = mqtt.connect('mqtt://test.mosquitto.org');
var topics = {'Java':{}, 'Python':{}, 'CSS3':{}, 'NodeJS':{}, 'Ruby':{}, 'Android':{}};
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
  		protocol.shift();
  		var discussion = protocol[0];
  		var preference = protocol[1];
  		client.subscribe(discussion + '-' + preference);
  		discussion = discussion.substring(5);
  		if (Object.keys(topics[preference]).includes(discussion)) {
  			topics[preference][discussion] += 1;
  		} else {
  			topics[preference][discussion] = 1;
  			attTopics();
  			attTopicsFilter(preference);
  		}
  		console.log('A discussion (' + discussion + ') tem ' + topics[preference][discussion] + ' online');
  	} else if (message.includes('sitf-publish')) {
  		var protocol = message.split(";");
  		protocol.shift();
  		client.publish(protocol[0], protocol[1]);
  	} else if (message.includes('sitf-topics')) {
  		ws.send('sitf-topics-return;' + getAllTopics());
  	} else if (message.includes('sitf-login')) {
  		var login = message.split(";")[1];
  		if (!logins.includes(login) && login != '') {
  			logins.push(login);
  			ws.send('sitf-login-sucess');
  		} else {
  			ws.send('sitf-login-failure');
  		}
  	} else if (message.includes('sitf-exit-subscribe')) {
  		var protocol = message.split(";");
  		protocol.shift();
  		var discussion = protocol[0].substring(5);
  		var preference = protocol[1];
  		topics[preference][discussion] -= 1;
  		console.log('A discussion (' + discussion + ') tem ' + topics[preference][discussion] + ' online');
  		if (topics[preference][discussion] <= 0) {
  			delete topics[preference][discussion];
  			attTopics();
  			attTopicsFilter(preference);
  		}
  	} else if (message.includes('sitf-filter-topics')) {
  		var protocol = message.split(';');
  		protocol.shift();
  		ws.send('sitf-filter-topics-return;' + getTopics(protocol));
  	}

    console.log('received: %s', message);
  });

  console.log('new connection');
});

function attTopicsFilter(filter) {
wss.clients.forEach(function each(c) {
		if (c.readyState === WebSocket.OPEN) {
			c.send('sitf-filter-topics-return;' + getTopics([filter]));
		}
	});
}


function attTopics() {
	wss.clients.forEach(function each(c) {
		if (c.readyState === WebSocket.OPEN) {
			c.send('sitf-topics-return;' + getAllTopics());
		}
	});
}

function getAllTopics() {
	return getTopics(Object.keys(topics));
}

function getTopics(preferences) {
	var topics_return = [];
	for (var i = 0; i < preferences.length; i++) {
		var discussions = Object.keys(topics[preferences[i]]);
		for (var j = 0; j < discussions.length; j++) {
			if(topics[preferences[i]][discussions[j]] > 0) {
				topics_return.push(discussions[j] + '<>' + preferences[i]);
			}
		}
	}
	return topics_return;
}