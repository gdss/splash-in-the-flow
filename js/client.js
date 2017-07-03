var ws = new WebSocket('ws://192.168.0.150:3000/splash');

var nickname;
var topic;
var preference_room;
var preferences = [];

ws.onopen = function() {
  //ws.send('something');
}

ws.onmessage = function(e) {
  if (e.data.includes('mqtt')) {
     var protocol = e.data.split(";");
     if (topic + "-"+ preference_room == protocol[1]) {
        addMessageToChat(protocol[2]);
        updateScroll();
     }
  } else if(e.data.includes('sitf-topics-return')) {

     listTopics("discussions-list",e.data);

  } else if (e.data.includes('sitf-login-sucess')) {
  	goDiscussions();
  } else if (e.data.includes('sitf-login-failure')) {
  	alert('O login já está em uso ou está inválido');
  } else if (e.data.includes('sitf-filter-topics-return')) {
  	
  	listTopics("discussions-list-filter",e.data);
  }
}

function listTopics(listId,data) {

  	   document.getElementById(listId).innerHTML = '';
   
      var protocol = data.split(';');
      protocol.shift();

      for (var i = 0; i < protocol.length; i++) {
        if (!protocol[i] == '') {
        		var discussion = protocol[i].split('<>');
           document.getElementById(listId).innerHTML += '<a href="#!" class="collection-item"><span class="new badge" data-badge-caption="">'+ discussion[1] +'</span><span class="discussion-topic">' + discussion[0] + '</span></a>'
        }
      }

        $('.collection-item').click(function() {
           goRoom($(this).children().eq(1).text(), $(this).children().eq(0).text());
        });
}

function addMessageToChat(message) {
  document.getElementById("room-chat").innerHTML += message + "<br>";
}

ws.onclose = function() {
  alert('close');
}

$('#login-start').click(function() {
  nickname = $('#login-input-nick').val();
  getPreferences();
  ws.send('sitf-login;' + nickname);
});

$('#new-discussion-submit').click(function() {
  var title = $('#new-discussion-title').val();
  var preference = $('#new-discussion-preference').val();
  goRoom(title, preference);
});

function goDiscussions() {
  ws.send("sitf-topics");
  $('#splash-login').css('display', 'none');
  $('#splash-discussions').css('display', 'block');
  $('#splash-room').css('display', 'none');
}

function goRoom(t, p) {
  topic = 'sitf-' + t;
  preference_room = p;
  var protocol = "sitf-subscribe;" + topic + ";" + p;
  ws.send(protocol);

	protocol = 'sitf-filter-topics'
  for (var i = 0; i < preferences.length; i++) {
  	protocol += ';' + preferences[i];
  }
  ws.send(protocol);
  
  $('#splash-discussions').css('display', 'none');
  $('#splash-room').css('display', 'block');
  $('#room-title').text(t);

  document.getElementById("room-chat").innerHTML = '';
  ws.send('sitf-publish;'+ topic + "-"+ preference_room +  ';' + nickname + ' entrou na sala');
}

function sendMessage(event) {
  var x = event.keyCode;
  if (x == 13) {
     ws.send('sitf-publish;'+ topic +'-' + preference_room + ';' + nickname + ': ' + $('#room-msg').val());
     $('#room-msg').val("");
  }
}

function updateScroll(){
	var element = document.getElementById("room-chat");
	element.scrollTop = element.scrollHeight;
}

$('#room-exit').click(function() {
	ws.send('sitf-exit-subscribe;' + topic + ';' + preference_room);
	goDiscussions();
});

function getPreferences() {
	$('input:checkbox[name=preference]:checked').each(function() {
		preferences.push($(this).val());
	});
}