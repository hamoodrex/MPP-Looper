
String.prototype.contains = function(str) { return this.indexOf(str) != -1; };
Array.prototype.contains = function(str) { return this.indexOf (str) != -1;};

var tempo = 120;
var bars = 4;
var beat = 4;


var recorded = [];
var isrecording = false;
var playinginterval;

function getTime(){
	return (new Date()).getTime();
}

var recordingtime = getTime();

function sendChat(msg) {
	MPP.chat.send(msg);
}

function tik(){
	MPP.press("c7",1);
}

function tok(){
	MPP.press("c6",1);
}

function play(){
	var time = 1000*(60/tempo)*beat;
	for (var i in recorded){
		var arr = recorded[i];
		var type = arr[0]
		var note = arr[1];
		var vol = arr[2];
		var diff = arr[3];
		if (type == "on"){
			setTimeout(MPP.press,diff,note,vol);
		}
		else if (type == "off"){
			setTimeout(MPP.release,diff,note);
		}
		
	}
	playinginterval = setInterval(function(){
		for (var i in recorded){
			var arr = recorded[i];
			var type = arr[0]
			var note = arr[1];
			var vol = arr[2];
			var diff = arr[3];
			if (type == "on"){
				setTimeout(MPP.press,diff,note,vol);
			}
			else if (type == "off"){
				setTimeout(MPP.release,diff,note);
			}
			
		}
	}, time*bars);
	
}

function record(){
	var time = 1000*(60/tempo)*beat;
	setTimeout(function(){
		isrecording = true;
		recordingtime = getTime();
		sendChat("Recording has started");
	},time);
	setTimeout(function(){
		isrecording = false;
		sendChat("Recording has stopped");
	},time*(bars+1));
	for (var i = 0; i <= bars; i++){
		var delay = i*time;
		setTimeout(function(){tik();},delay);
		for (var j = 1; j < beat; j++){
			setTimeout(function(){tok();},delay+j*(time/beat));
		}
	}
	
}

MPP.client.on("a", function (msg) {
	var args = msg.a.split(' ');
	var cmd = args[0];
	var input = msg.a.substring(cmd.length).trim();
	var isAdmin = (msg.p._id == MPP.client.user._id);
	if (!isAdmin){
		return;
	}
	
	if (cmd == "/js"){
		try {
			sendChat("Output: " + eval(input));
		} catch (err) {
			if (err != "Output: undefined"){
				sendChat(''+err);
			}
		}	
	}
	if (cmd == "/settempo"){
		try{
			tempo = parseInt(input);
			sendChat("You have set the tempo to: "+input);
		}catch (err){
			sendChat("Please enter a proper number");
		}
	}
	
	if (cmd == "/setbars"){
		try{
			bars = parseInt(input);
			sendChat("You have set amount of bars to: "+input);
		}catch (err){
			sendChat("Please enter a proper number");
		}
	}
	
	if (cmd == "/setbeat"){
		try{
			beat = parseInt(input);
			sendChat("You have set the beat to: "+input);
		}catch (err){
			sendChat("Please enter a proper number");
		}
	}
	
	if (cmd == "/record"){
		recorded = [];
		sendChat("Recording will start after first bar!");
		record();
	}
	
	if (cmd == "/play"){
		sendChat("Starting to play the recorded loop");
		play();
	}
	
	if (cmd == "/stop"){
		sendChat("Playing will stop next loop!");
		clearInterval(playinginterval);
	}
	
});

// keyboard detection stuff

$(document).on("keydown", handleKeyDown );
$(document).on("keyup", handleKeyUp);
var Note = function(note, octave) {
	this.note = note;
	this.octave = octave || 0;
};
	var mx = 0, last_mx = -10, my = 0, last_my = -10;

$(document).mousemove(function(event) {
	mx = ((event.pageX / $(window).width()) * 100).toFixed(2);
	my = ((event.pageY / $(window).height()) * 100).toFixed(2);
});
var n = function(a, b) { return {note: new Note(a, b), held: false}; };
var key_binding = {
	65: n("gs"),
	90: n("a"),
	83: n("as"),
	88: n("b"),
	67: n("c", 1),
	70: n("cs", 1),
	86: n("d", 1),
	71: n("ds", 1),
	66: n("e", 1),
	78: n("f", 1),
	74: n("fs", 1),
	77: n("g", 1),
	75: n("gs", 1),
	188: n("a", 1),
	76: n("as", 1),
	190: n("b", 1),
	191: n("c", 2),
	222: n("cs", 2),
	
	49: n("gs", 1),
	81: n("a", 1),
	50: n("as", 1),
	87: n("b", 1),
	69: n("c", 2),
	52: n("cs", 2),
	82: n("d", 2),
	53: n("ds", 2),
	84: n("e", 2),
	89: n("f", 2),
	55: n("fs", 2),
	85: n("g", 2),
	56: n("gs", 2),
	73: n("a", 2),
	57: n("as", 2),
	79: n("b", 2),
	80: n("c", 3),
	189: n("cs", 3),
	173: n("cs", 3), // firefox why
	219: n("d", 3),
	187: n("ds", 3),
	61: n("ds", 3), // firefox why
	221: n("e", 3)
};
var velocityFromMouseY = function() {
	return 0.1 + (my / 100) * 0.6;
};
var transpose_octave = 0;
var sustain = false;
function handleKeyDown(evt){
	if ($("#chat").hasClass("chatting"))
		return;
	var code = parseInt(evt.keyCode);
	if(key_binding[code] !== undefined) {
		var binding = key_binding[code];
		if (binding.held)
			return;
		binding.held = true;
		var note = binding.note;
		var vol = velocityFromMouseY();
		var octaveadded = 0;
		if(evt.shiftKey) ++octaveadded;
		else if(evt.ctrlKey) --octaveadded;
		var nt = note.note + (1 + note.octave +transpose_octave+octaveadded);
		// This part is where I detect the key and play the chord based on the scale/chord-type (Incomplete)
		if (isrecording){
			var diff = getTime() - recordingtime;
			var type = "on";
			recorded.push([type,nt,vol,diff]);
		}
		
	} else if((code === 38 || code === 39) && transpose_octave < 3) {
		++transpose_octave;
	} else if((code === 40 || code === 37) && transpose_octave > -2) {
		--transpose_octave;
	}
	else if(code == 9) { // Tab (don't tab away from the piano)
		evt.preventDefault();
	}
	else if(code == 8) { // Backspace (don't navigate Back)
		sustain = !sustain;
		evt.preventDefault();
	}
}
function handleKeyUp(evt){
	if ($("#chat").hasClass("chatting"))
		return;
	var code = parseInt(evt.keyCode);
	if(key_binding[code] !== undefined) {
		var binding = key_binding[code];
		if(!binding.held)
			return;
		binding.held = false;
		var note = binding.note;
		var vol = velocityFromMouseY();
		var octaveadded = 0;
		if(evt.shiftKey) ++octaveadded;
		else if(evt.ctrlKey) --octaveadded;
		var nt = note.note + (1 + note.octave +transpose_octave+octaveadded);
		// This part is where I detect the key and play the chord based on the scale/chord-type (Incomplete)
		if (isrecording){
			if (sustain)
				return;
			var diff = getTime() - recordingtime;
			var type = "off";
			recorded.push([type,nt,vol,diff]);
		}
		
	}
	else if(code == 9) { // Tab (don't tab away from the piano)
		evt.preventDefault();
	}
}



