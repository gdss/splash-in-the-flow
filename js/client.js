var ws = new WebSocket('ws://192.168.0.150:3000/splash');

var nickname;
var topic;

ws.onopen = function() {
  //ws.send('something');
}

ws.onmessage = function(e) {
  if (e.data.includes('mqtt')) {
     var protocol = e.data.split(";");
     if (topic == protocol[1]) {
        addMessageToChat(protocol[2]);
        updateScroll();
     }
  } else if(e.data.includes('sitf-topics-return')) {

     document.getElementById("discussions-list").innerHTML = '';
   
      var protocol = e.data.split(";");
      protocol.shift();
      protocol = protocol.toString().split(',');

      for (var i = 0; i < protocol.length; i++) {
        if (!protocol[i] == '') {
           document.getElementById("discussions-list").innerHTML += '<a href="#!" class="collection-item"><span class="new badge" data-badge-caption="">SI</span><span class="discussion-topic">' + protocol[i] + '</span></a>'
        }
      }

        $('.collection-item').click(function() {
           goRoom($(this).children().eq(1).text());
        });

  } else if (e.data.includes('sitf-login-sucess')) {
  	goDiscussions();
  } else if (e.data.includes('sitf-login-failure')) {
  	alert('O login já está em uso ou está inválido');
  }
}

function addMessageToChat(message) {
  document.getElementById("room-chat").innerHTML += message + "<br>";
}

ws.onclose = function() {
  alert('close');
}

$('#login-start').click(function() {
  nickname = $('#login-input-nick').val();
  ws.send('sitf-login;' + nickname);
});

$('#new-discussion-submit').click(function() {
  var title = $('#new-discussion-title').val();
  goRoom(title);
});

function goDiscussions() {
  ws.send("sitf-topics");
  $('#splash-login').css('display', 'none');
  $('#splash-discussions').css('display', 'block');
  $('#splash-room').css('display', 'none');
}

function goRoom(t) {
  topic = 'sitf-' + t;
  var protocol = "sitf-subscribe;" + topic;
  ws.send(protocol);
  $('#splash-discussions').css('display', 'none');
  $('#splash-room').css('display', 'block');
  $('#room-title').text(t);

  document.getElementById("room-chat").innerHTML = '';
  ws.send('sitf-publish;'+ topic + ';' + nickname + ' entrou na sala');
}

function sendMessage(event) {
  var x = event.keyCode;
  if (x == 13) {
     ws.send('sitf-publish;'+ topic + ';' + nickname + ': ' + $('#room-msg').val());
     $('#room-msg').val("");
  }
}

function updateScroll(){
	var element = document.getElementById("room-chat");
	element.scrollTop = element.scrollHeight;
}

$('#room-exit').click(function() {
	ws.send('sitf-exit-subscribe;' + topic);
	goDiscussions();
});
