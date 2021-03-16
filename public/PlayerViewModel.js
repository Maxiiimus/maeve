let ac = new AudioContext();

// Class to represent a single song
function Song(data) {
    let self = this;
    self.item_id = data.item_id;
    self.song_id = data.song_id;
    self.title = data.title;
    self.artist = data.artist;
    self.midi_path = data.midi_path;
    self.image_path = data.image_path;
}

// Class to hold a channel number and an instrument
function Channel(channelNumber, instrument) {
    let self = this;
    self.channelNumber = channelNumber;
    self.instrument = instrument;
    self.notes = new Array(128);
}

// ========================================================================================================
// This is the ModelView for the data driving the UI it also receives updates from the server via Socket.IO
// ========================================================================================================
function PlayerViewModel() {
    let self = this;
    self.socket = io();
    self.instruments = [];
    self.channels = [];

    let ac = new AudioContext();
    // This is used to hear audio playing on the client. Useful for testing, but doesn't sound great
    self.piano = null;
    Soundfont.instrument(ac, 'accordion').then(function (p) {
        self.piano = p;
    });

    // Create an array for instruments midiInstruments
    //for (let i = 0; i < midiInstruments.length; i++) {
    //    Soundfont.instrument(ac, midiInstruments[i]).then(function (instrument) {
    //        self.instruments.push(instrument);
    //    });
    //}

    // Placeholder text when there is no currentSong from the server yet
    let welcomeSong = new Song({item_id: -1, song_id: -1, title: "Hello Darling", artist: "Maeve",
        midi_path: "", image_path: "images/artists/Welcome Image.png"});
    self.currentSong = ko.observable(welcomeSong);

    self.timePlayedString = ko.observable("");
    self.timeRemainingString = ko.observable("");

    //self.audioOn = ko.observable(false);
    self.isPlaying = ko.observable(false);

    self.library = ko.observableArray([]);
    self.currentSongPercent = ko.observable(70);
    self.values = ko.computed({
        read: function() {
            return self.currentSongPercent();
        },
        write: function(newValue) {
            self.currentSongPercent(newValue);
        },
        owner: self
    });

    // Call the server to register as a note player
    self.socket.emit('register player');

    // Method: 'load instruments'
    //
    // channels: An array of channel numbers with corresponding instrument to play the current song
    self.socket.on('load channel instruments', function (channels) {
        // Clear the current instruments
        self.channels = [];
        //console.log("Loading instruments: " + JSON.stringify(channels));
        // Load instruments for all the channels
        for (let i = 0; i < channels.length; i++) {
            if (channels[i].channelNumber === 10) {
                // Channel 10 is typically drums, so load "percussion"
                Soundfont.instrument(ac, 'percussion-mp3.js').then(function (instrument) {
                    let channel = new Channel(channels[i].channelNumber, instrument);
                    self.channels.push(channel);
                    //console.log("Loaded instrument: " + JSON.stringify(channels[i]));
                });
            } else {
                Soundfont.instrument(ac, midiInstruments[channels[i].instrumentNumber]).then(function (instrument) {
                    let channel = new Channel(channels[i].channelNumber, instrument);
                    self.channels.push(channel);
                    //console.log("Loaded instrument: " + JSON.stringify(channels[i]));
                });
            }
        }
    });

    // Method: 'play note'
    //
    // event: The midi event info
    self.socket.on('play note', function (event) {
        // Error check
        if (event == null) return;

        if (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off") {
            // Select the instrument
            let instrument = null;
            let channel = null;
            for (let i = 0; i < self.channels.length; i++) {
                if (self.channels[i].channelNumber === event.channel) {
                    instrument = self.channels[i].instrument;
                    channel = self.channels[i];
                    break;
                }
            }
            if (instrument === null) return;
            if (event.name.toLowerCase() === "note on" && event.velocity !== 0) {
                // Start playing note and save the note so it can be stopped
                let note = instrument.play(event.noteName, ac.currentTime, {gain: event.velocity / 100});
                //console.log("Event: " + JSON.stringify(event));
                //console.log("Note: " + JSON.stringify(note));
                if (event.noteNumber < 128) {
                    channel.notes[event.noteNumber] = note;
                }
            } else if (event.name.toLowerCase() === "note off" || event.velocity === 0) {
                //instrument.play(event.noteName).stop(ac.currentTime + 0.5);
                //console.log("Channel: " + JSON.stringify(channel));
                if (event.noteNumber < 128 && channel.notes[event.noteNumber] != null) {
                    channel.notes[event.noteNumber].stop();
                    console.log(JSON.stringify(channel.notes[event.noteNumber]));
                }
                //instrument.play(event.noteName).stop();
            }
        }
    });

    // "update song" is called to update the total song time and the time left
    self.socket.on('update song', function (song, isPlaying, songTime, timeRemaining) {
        if (song.song_id !== self.currentSong.song_id) {
            self.currentSong(song); // If the song has changed, update currentSong
        }

        let timePlayed = songTime - timeRemaining;
        let percent = 0;
        if (songTime !== 0) {
            percent = Math.floor((songTime - timeRemaining) / songTime * 100.0);
        }

        self.isPlaying(isPlaying);
        self.currentSongPercent(percent);
        self.timePlayedString(self.getTimeString(timePlayed));
        self.timeRemainingString("-" + self.getTimeString(timeRemaining));

        if (!self.pauseSliderMoves) {
            $("#timeslider").val(percent); // Could not get binding to the percent to work to change the slider
            $("#timeslider").slider("refresh"); // Explicitly update the slider
        }
    });

    // Converts time in seconds to a minutes:seconds string
    self.getTimeString = function(time) {
        let minutes = Math.floor(time / 60.0);
        let seconds = Math.floor(time - minutes * 60);
        return(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
    };
}

// Activates knockout.js
ko.applyBindings(new PlayerViewModel());
