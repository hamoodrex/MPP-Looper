String.prototype.contains = function(str) { return this.indexOf(str) != -1; };
Array.prototype.contains = function(str) { return this.indexOf (str) != -1;};

/*
the tempo of the recording, if changed note timings don't 
so if you already recorded it will get messed up
*/
var tempo = 120;
// how many bars in a recording
var bars = 4;
// the amount of beats in one bar
var beat = 4;

// recorded holds all recorded notes
var recorded = [];
/*
temprecorded holds all notes recorded in a recording session,
is cleared when recording is done and pushed onto recorded
*/
var temprecorded = [];
// a boolean to detect if script is recording
var isrecording = false;
/*
if this is true then recorded array won't be cleared
this allows for layering recordings on top of each other
*/
var layering = false;
// interval for looping the recorded piece
var playinginterval;


// method to get current system time
function getTime(){
	return (new Date()).getTime();
}

// idk why this is here but the variable is used to set recorded note offsets from the start of the recording
var recordingtime = getTime();

// sending chat stuff
function sendChat(msg) {
	MPP.chat.send(msg);
}

// bip
function tik(){
	MPP.press("c7",1);
}

// bop
function tok(){
	MPP.press("c6",1);
}

// timeouts holds all notes to be played in the effort to cancel them on /stop
var timeouts = [];
function playrecorded(){
	for (var i in recorded){
		var arr = recorded[i];
		var type = arr[0]
		var note = arr[1];
		var vol = arr[2];
		var diff = arr[3];
		// pushing setTimeout for note press
		if (type == "on"){
			timeouts.push(setTimeout(MPP.press,diff,note,vol));
		}
		// pushing setTimeout for note release
		else if (type == "off"){
			timeouts.push(setTimeout(MPP.release,diff,note));
		}
		// This is to not store too much in timeouts
		if (timeouts.length >= recorded.length*3){
			for (var i = 0; i < recorded.length; i++){
				timeouts.shift();
			}
		}
		
	}
}

// loop the recorded part infinitely until stopped
function play(){
	var time = 1000*(60/tempo)*beat;
	playrecorded();
	playinginterval = setInterval(function(){
		playrecorded();
	}, time*bars);
	
}

// an offset to start the actual recording before metronome, helpful for not missing notes played exactly on the ticking
var offset = 200;
// togrecord is used in case you want to stop recording before recording timer is finished
var togrecord;
// tognote is another array in case you want to stop recording to clear timeouts
var tognote = [];
function record(){
	var time = 1000*(60/tempo)*beat;
	temprecorded = [];
	if (layering){
		setTimeout(function(){
			playrecorded();
		},time-offset);
	}
	setTimeout(function(){
		isrecording = true;
		recordingtime = getTime();
		sendChat("Recording has started");
	},time-offset);
	togrecord = setTimeout(function(){
		isrecording = false;
		recorded = recorded.concat(temprecorded);
		sendChat("Recording has stopped");
	},time*(bars+1) + offset);
	for (var i = 0; i <= bars; i++){
		var delay = i*time;
		tognote.push(setTimeout(function(){tik();},delay));
		for (var j = 1; j < beat; j++){
			tognote.push(setTimeout(function(){tok();},delay+j*(time/beat)));
		}
	}
	
}

// a lovely event handler thing
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
		if (!layering)
			recorded = [];
		sendChat("Recording will start after first bar!");
		if (isrecording){
			isrecording = false;
			recorded = recorded.concat(temprecorded);
			sendChat("Recording has stopped");
			clearTimeout(togrecord);
			tognote.forEach(t => clearTimeout(t));
			tognote = [];
			return;
		}
		record();
	}
	
	if (cmd == "/play"){
		sendChat("Starting to play the recorded loop");
		play();
	}
	
	if (cmd == "/stop"){
		sendChat("Playing will stop next loop!");
		clearInterval(playinginterval);
		timeouts.forEach(t => clearTimeout(t));
		timeouts = [];
	}
	
	if (cmd == "/layering"){
		layering = !layering;
		sendChat("Layering set to: " + layering);
	}
	
});

// keyboard detection stuff
// this part is nabbed from script.js

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
var transpose = 0;
var sustain = false;

// notes in recorded/temprecorded arrays are stored by this format per element: [note-type, note-name, note-volume, note-offset-from-timer]
// note-type: on,off
// note-name: the name of the note, already handled by the key_binding object, if you have another layout you might want to change this as well
// note-volume: 0 to 1
// note-offset-from-timer: time in millisecond from start of recording till note press/release
var piano_keys = Object.keys(MPP.piano.keys);
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
		var nt = note.note + (1 + note.octave+octaveadded);
		try{
			nt = piano_keys[piano_keys.indexOf(nt)+transpose];
			// record note press
			if (isrecording){
				var diff = getTime() - recordingtime;
				var type = "on";
				temprecorded.push([type,nt,vol,diff]);
			}
		}
		catch(err){}
		
	} else if(code === 38) {
		transpose += 12;
	} else if(code === 40) {
		transpose -= 12;
	} else if(code === 39) {
		transpose++;
	} else if(code === 37) {
		transpose--;
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
		var nt = note.note + (1 + note.octave+octaveadded);
		try{
			nt = piano_keys[piano_keys.indexOf(nt)+transpose];
			// record note releases and ignore if sustain is enabled
			if (isrecording){
				if (sustain)
					return;
				var diff = getTime() - recordingtime;
				var type = "off";
				temprecorded.push([type,nt,vol,diff]);
			}
			
		} catch(err){}
	}
	else if(code == 9) { // Tab (don't tab away from the piano)
		evt.preventDefault();
	}
}

// attempting midi stuff


// Check if browser can request midi access
if (navigator.requestMIDIAccess) {
    console.log('MIDI is supported on this browser!');
	
	navigator.requestMIDIAccess().then(
	function(midiAccess){
		// loop through all midi inputs and register a midi message handler for each
		for (var input of midiAccess.inputs.values()){
			input.onmidimessage = midiMessageReceived;
		};
	},function(){console.log("Failed to access midi devices!");});
	
} else {
    console.log('MIDI is not supported on this browser');
}

function midiMessageReceived(msg) {
    //console.log(msg);
	var data = msg.data;
	// type of data received, 144 = note on, 128 = note off
	var type = data[0];
	// midi key id 0 - 127, 21 is the lowest A note
	var id = data[1];
	// midi velocity ranges from 0 to 127
	var vel = data[2]/127;
	
	var noteon = type == 144;
	// as I read sometimes vel 0 can mean note-off msg
	var noteoff = (type == 128) || (vel == 0);
	
	var note = piano_keys[id-21];
	
	if (note === undefined)
		return;
	
	if (noteon){
		// record note press
		if (isrecording){
			var diff = getTime() - recordingtime;
			temprecorded.push(["on",note,vel,diff]);
		}
	}
	else if (noteoff){
		// record note releases and ignore if sustain is enabled
		if (isrecording){
			if (sustain)
				return;
			var diff = getTime() - recordingtime;
			temprecorded.push(["off",note,vel,diff]);
		}
	}
	
}
