# MPP-Looper
This is an MPP looper. Open to further improvements!

It is a simple script that you paste in your browser's "inspect element" tab
This script allows you to record a piece and replay it in a loop

It is a very useful script if you want to accompany yourself but you only have a small midi keyboard or just a normal computer keyboard

Commands:
- /settempo - sets the tempo (the speed of the beat), 60 bpm = 1 tik per second
- /setbars - sets that amount of bars, more bars = more recording time
- /setbeat - sets the beat of the metronome for recording, the beat is how many tiks per bar
- /play - starts playing your recording in an infinite loop
- /stop - stops playing the loop
- /record - starts the recording process gives 1 extra bar at the beginning to prepare
- /layering - enabling this allows you to record on top of your old recording
- /js - an eval function to run scripts in chat! Use something like "/js recorded = []" to clear recorded notes

This script supports MIDI, any midi input will be detected!
