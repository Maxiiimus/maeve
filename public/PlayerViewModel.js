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

// Class to hold a instrument and notes being played
function Instrument(instrument) {
    let self = this;
    self.instrument = instrument;
    self.notes = new Array(128);
}

const NUM_CHANNELS = 16;
const NUM_INSTRUMENTS = 128;

// ========================================================================================================
// This is the ModelView for the data driving the UI it also receives updates from the server via Socket.IO
// ========================================================================================================
function PlayerViewModel() {
    let self = this;
    self.socket = io();
    //self.instruments = [];
    //self.channels = [];

    //self.instruments = new Array(CHANNEL_COUNT);
    //self.channels = new Array(NUM_CHANNELS); // Contains the instrument numbers for each channel
    self.instruments = new Array(NUM_CHANNELS);

    let ac = new AudioContext();

    // Drums are treated different from the rest of the instruments, so create a specific drums instrument
    /*self.drums = null;
    Soundfont.instrument(ac, 'instruments/synth_drum-mp3.js').then(function (instrument) {
        self.drums = new Instrument(instrument);
        console.log("Loaded Drums");
    });

    // Fill the array of instruments from midiInstruments
    for (let i = 0; i < NUM_INSTRUMENTS; i++) {
        Soundfont.instrument(ac, 'instruments/'+ midiInstruments[i] +
                                        '-mp3.js').then(function (instrument) {
            self.instruments[i] = new Instrument(instrument);
            console.log("Loaded instrument [" + i + "]:" + midiInstruments[i]);
        });
    }*/

    // Placeholder text when there is no currentSong from the server yet
    let welcomeSong = new Song({item_id: -1, song_id: -1, title: "Hello Darling", artist: "Maeve",
        midi_path: "", image_path: "images/artists/Welcome Image.png"});
    self.currentSong = ko.observable(welcomeSong);

    self.timePlayedString = ko.observable("");
    self.timeRemainingString = ko.observable("");

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
    // channels: An array of 16 channels with the instrument number
    self.socket.on('load channel instruments', function (channels) {
        //self.channels = channels; // Save the list of which channel is playing which instrument
        // Load instruments for all the channels
        for (let i = 0; i < channels.length; i++) {
            // Channel 10 is typically drums, so load "percussion"
            let instrumentPath = channels[i].channelNumber === 10 ? 'instruments/percussion/standard_set-mp3.js'
                : 'instruments/'+ midiInstruments[channels[i].instrumentNumber] + '-mp3.js'; //midiInstruments[channels[i]];
            console.log("Loading instrument[" + (channels[i].instrumentNumber) + "]: " + instrumentPath);
            Soundfont.instrument(ac, instrumentPath).then(function (instrument) {
                self.instruments[channels[i].channelNumber-1] = new Instrument(instrument);
            });
        }
    });

    // Method: 'play note'
    //
    // event: The midi event info
    self.socket.on('play note', function (event) {
        // Error check
        if (event == null) return;

        if (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off") {

            if (event.channel < 1 || event.channel > NUM_CHANNELS || self.instruments[event.channel-1] === null) return;
            let currentInstrument = self.instruments[event.channel-1];

            //if (event.channel < 1 || event.channel > self.channels.length) return;
            //let instrumentNum = self.channels[event.channel-1]; // Get the instrument number for the channel
            //if (instrumentNum < 0 || instrumentNum >= self.instruments.length) return;

            // Set the instrument to drums if this note is on channel 10, otherwise, pick the instrument by number
            //let currentInstrument = event.channel === 10 ? self.drums : self.instruments[instrumentNum];

            //console.log("playing note on channel: " + event.channel);

            if (event.name.toLowerCase() === "note on" && event.velocity !== 0) {
                // Start playing note and save the note so it can be stopped
                let note = (event.channel === 10) ? currentInstrument.instrument.play(event.noteName, ac.currentTime)
                     : currentInstrument.instrument.play(event.noteName, ac.currentTime, {gain: event.velocity / 100});
                //console.log("Event: " + JSON.stringify(event));
                //console.log("Note: " + JSON.stringify(note));
                // Save the note so it can be stopped
                if (event.noteNumber < 128) {
                    currentInstrument.notes[event.noteNumber] = note;
                }
            } else if (event.name.toLowerCase() === "note off" || event.velocity === 0) {
                //instrument.play(event.noteName).stop(ac.currentTime + 0.5);
                //console.log("Channel: " + JSON.stringify(channel));
                // Stop the note
                if (event.noteNumber < 128 && currentInstrument.notes[event.noteNumber] != null) {
                    currentInstrument.notes[event.noteNumber].stop();
                    //console.log(JSON.stringify(channel.notes[event.noteNumber]));
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
