const MidiPlayer = require('midi-player-js');
const fs = require('fs');
const KeyRegister = require('./KeyRegister');
const VacuumController = require('./VacuumController');
const SustainController = require('./SustainController');
const MusicLibrary = require('./MusicLibrary');
//const NotePlayer = require('../synth/NotePlayer');
const Synthesizer = require('./Synthesizer');

// Key module settings
const MODULE_COUNT = 11;
const REGISTER_SIZE = 8;

const CLIENT_INTERVAL = 250; // milliseconds between updates to client if needed
const KEY_TEST_DELAY = 250; // The delay between playing each key during the tests
const REGISTER_DELAY = 50; // The delay between updating the key register

class PianoServer {
    constructor() {

        this.keyIndex = 0;
        this.testKey = 0;

        this.currentSong = {
            id: -1,
            title: "Hello Darling",
            artist: "Maeve",
            path: "",
            image: "images/artists/Welcome Image.png"
        };

        // This is the current playlist or queue.
        // This is the playlist that appears in the UI
        this.playlist = [];

        // This is actual internal list that is used for playing
        // It is randomized if shuffle is enabled. It is also recreated if repeat is enabled.
        // If a song is added to the queue while playing, it is added to this list too
        this.internalPlaylist = [];
        this.playlistChanged = false;
        this.playlistNameChanged = false;
        this.playlistsChanged = false;
        this.libraryChanged = false;
        this.newPlaylistName = "";
        this.playlistMode = false;
        this.playlistIndex = 0;
        this.currentSongTime = 0;
        this.currentSongTimeRemaining = 0;
        this.currentSongTotalTicks = 0;
        this.songLoaded = false;
        this.songEnded = false;
        this.clientsConnected = false;
        this.underTest = false;
        this.pianoChannel = 1; // Used to keep track of which channel is used for the piano

        // These arrays are an in memory updated by the library as they change and are passed by reference
        this.allSongs = []; // The list of all songs in the database
        this.playlists = []; // The list of all playlists in the database
    }

    start (http, io, port) {
        this.vacuumController = new VacuumController();
        this.sustainController = new SustainController();
        this.synthesizer = new Synthesizer();
        //this.notePlayer = new NotePlayer();
        this.register = new KeyRegister(REGISTER_SIZE, MODULE_COUNT);
        this.numKeys = REGISTER_SIZE * MODULE_COUNT;
        this.keys = Buffer.alloc(this.numKeys).fill(0);

        // Connect to the music library database
        // Pass in the arrays for the songs, playlists, and current playlist (by reference)
        this.musicLibrary = new MusicLibrary(this.allSongs, this.playlists, this.playlist);

        // Open connection to clients
        this.io = io;
        this.listen(http, port);

        // Start up the player
        this.player = this.initializePlayer();

        // Update the clients every 250ms
        setInterval(this.updateClientsLoop.bind(this), CLIENT_INTERVAL);
    }

    initializePlayer() {
        // Initialize player and register event handler
        let p = new MidiPlayer.Player( (event) => {
            let keyIndex = 21;
            let keyOn = 0; // Default to "Note off" with a 0

            // Check for the sustain pedal
            if (event.name && (event.name.toLowerCase() === "controller change" && event.number === 64)) {
                if (event.value > 0) {
                    console.log("Got sustain ON");
                    this.sustainController.pedalOn();
                } else {
                    console.log("Got sustain OFF");
                    this.sustainController.pedalOff();
                }
            }

            if (event.channel && event.channel !== this.pianoChannel) {
                this.synthesizer.playMidiEvent(event);
            }

            // When we get a "Note on" or "Note off" event, update the values in the shift register
            // Also, update the clients in case they are playing the audio locally
            if (event.name && (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off")) {
                let millis = Date.now();

                if (event.channel && event.channel === this.pianoChannel) {
                    // Send this to note player client(s) only
                    //this.io.to('note players').emit('play note', event);

                    // "Note off" is also represented as a velocity of 0
                    // So, we default to 0, but change the value if velocity is not 0
                    if (event.velocity !== 0) {
                        keyOn = 1;
                    }

                    // Piano key midi notes start at 21
                    keyIndex = event.noteNumber - 21;

                    if (keyIndex < 0 || keyIndex >= 88) {
                        console.log("event.noteNumber out of range! " + keyIndex);
                        return;
                    }

                    // Check if the key is already being "played"
                    if (this.keys[keyIndex] === keyOn && keyOn === 1) {
                        console.log("KEY ALREADY ON: " + event.noteNumber);

                        // If the note is already playing, then we want to strike it again
                        // First, turn it off and then schedule it to be played in REGISTER_DELAY milliseconds
                        keyOn = 0;

                        setTimeout((i) => {
                            this.keys[i] = 1;
                            this.register.send(this.keys);
                        }, REGISTER_DELAY, keyIndex);
                    }
                    this.keys[keyIndex] = keyOn;
                    this.register.send(this.keys);
                }

                // Calculate time remaining using the current tick
                let remainingTicks = this.currentSongTotalTicks - event.tick;
                this.currentSongTimeRemaining = Math.floor(remainingTicks / this.currentSongTotalTicks * this.currentSongTime);
            }
        });

        // Listen for the end of a file
        p.on('endOfFile', () => {
            console.log("End of file reached: " + this.currentSong.title);
            this.resetKeys();
            //this.register.send(this.keysOff); // Sometimes keys are left on, turn them all off
            //this.sustainController.pedalOff();
            //this.songEnded = true;
            if (this.playlistMode) {
                //this.playNextSong(true); // Play the next song (if there is one to play) <= Deadlock
                this.songEnded = true; // Set this to true and the next song will be started in updateClientsLoop()
            } else {
                this.vacuumController.turnOff();
            }
        });

        return (p);
    }

    listen(http, port) {
        this.io.on('connection', (socket) => {
            this.clientsConnected = true;
            console.log('A user connected: ' + JSON.stringify(socket.id));

            this.io.emit('load library', this.allSongs);
            this.io.emit('load playlists', this.playlists, this.musicLibrary.currentPlaylistID);
            this.io.emit('update playlist', this.playlist, this.musicLibrary.currentPlaylistID);

            socket.on("reload library", () => {
                this.musicLibrary.rebuildLibrary( (err) => {
                    if (!err) {
                        this.playlistChanged = true;
                        this.playlistsChanged = true;
                        this.libraryChanged = true;
                    }
                });
            });

            // This is called from player.html so we only send notes to that client using a room, 'note players'
            socket.on("register player", () => {
                console.log("A note player has registered: " + socket.id);
                socket.join("note players");
            });

            socket.on("set song", (song) => {
                this.setSong(song);
            });

            // Play a specific song. This is when a user just clicks a song from the Library.
            socket.on("play song", (song) => {
                this.playlistMode = false;
                this.setSong(song);
                this.play(true);
            });

            // A user clicked on an item in the playlist which starts the playlist from that point
            socket.on("play playlist", (shuffle, index) => {
                this.startPlaylist(shuffle, index);
            });

            socket.on("toggle play", (shouldPlay) => {
                console.log("Toggling play to: " + shouldPlay);
                this.stopTests();
                this.play(shouldPlay);
            });

            socket.on("previous song", () => {
                console.log("Previous song");
                this.playPreviousSong(this.player.isPlaying());
            });

            socket.on("next song", () => {
                console.log("Next song");
                this.playNextSong(this.player.isPlaying());
            });

            socket.on("set time", (percent) => {
                this.setCurrentSongTime(percent);
            });

            socket.on("run test", (testNumber, key, delay) => {
                this.play(false);
                this.testKey = key; // testKey is used when testing an individual key
                this.runKeyTest(testNumber, delay); // Delay is used to adjust the speed of the test
            });

            // Adds a song by ID to the current playlist
            socket.on('add to playlist', (songID) => {
                this.musicLibrary.addSongToPlaylist(songID, (err) => {
                    if (!err) {
                        this.playlistChanged = true;
                    }
                });
            });

            // Removes a song from the current playlist by removing the entry in playlist_items by item_id
            socket.on('remove from playlist', (itemID) => {
                this.musicLibrary.removeSongFromPlaylist(itemID, (err) => {
                    if (!err) {
                        this.playlistChanged = true;
                    }
                });
            });

            // Deletes the current playlist
            socket.on('delete playlist', () => {
                this.musicLibrary.deletePlaylist((err) => {
                    if (!err) {
                        this.playlistsChanged = true;
                    }
                });
            });

            // Switches the current playlist to playlistID
            socket.on('select playlist', (playlistID) => {
                this.musicLibrary.getPlaylist(playlistID, (err) => {
                    if (!err) {
                        this.playlistChanged = true;
                    }
                });
            });

            // Creates a playlist with the given "name"
            socket.on('create playlist', (name) => {
                this.musicLibrary.createPlaylist(name,(err) => {
                    if (!err) {
                        this.playlistsChanged = true;
                    }
                });
            });

            // Changes the name for the current playlist
            socket.on('rename playlist', (name) => {
                this.musicLibrary.renamePlaylist(name,(err) => {
                    if (!err) {
                        this.newPlaylistName = name;
                        this.playlistNameChanged = true;
                    }
                });
            });

            socket.on('update playlist', (p) => {
                //console.log('incoming playlist: ' + p);
                this.playlist = p;
                this.playlistChanged = true; // Update all connected clients' playlist
            });

            socket.on('disconnect', (reason) => {
                console.log('User disconnected: ' + reason);
            });

            socket.on('test roundtrip', (callStart) => {
                let currentTime = Date.now();
                console.log("Current time: " + currentTime);
                console.log('MS since call:  ' + (currentTime - callStart));
                this.io.emit('roundtrip return', callStart);

                this.notePlayer.screenShot();
            });
        });

        http.listen(port, () => {
            console.log("Running server on port %s", port);
        });
    }

    // Set an interval to update all connected clients
    updateClientsLoop() {
        // If a song has ended and we're playing a playlist, then play the next song
        if (this.songEnded && this.playlistMode) {
            this.playNextSong(true);
            this.songEnded = false;
        }

        if (this.libraryChanged) {
            if (this.clientsConnected) {
                this.io.emit('load library', this.allSongs);
            }
            this.libraryChanged = false;
        }

        // Only update client playlist if it's changed
        if (this.playlistChanged) {
            if (this.clientsConnected) {
                this.io.emit('update playlist', this.playlist, this.musicLibrary.currentPlaylistID);
            }
            this.playlistChanged = false;
        }

        // Update this list of playlists
        if (this.playlistsChanged) {
            if (this.clientsConnected) {
                console.log("loading playlists, selecting playlist: " + this.musicLibrary.currentPlaylistID)
                this.io.emit('load playlists', this.playlists, this.musicLibrary.currentPlaylistID);
            }
            this.playlistsChanged = false;
        }

        // This happens if a playlist is renamed. We only want to update the clients of a name change.
        // But, not trigger reloading playlists
        if (this.playlistNameChanged) {
            this.io.emit('update playlist name', this.newPlaylistName);
            this.playlistNameChanged = false;
        }

        // Let the clients know what song is playing, update time and settings
        if (this.clientsConnected) {
            this.io.emit("update song", this.currentSong, this.player.isPlaying(),
                this.currentSongTime, this.currentSongTimeRemaining);
        }
    }

    // play() - plays or pauses the current song
    play(shouldPlay) {
        // This stops any tests that might be running
        if (this.testInterval) {
            clearInterval(this.testInterval);
        }

        // If there is no song loaded, no point in playing or pausing
        if (!this.songLoaded) {
            return;
        }

        if (shouldPlay) {
            // If the vacuum pump is off, wait 2 seconds for it to spin up
            let waitForPump = this.vacuumController.isOn() ? 0 : 2000;
            this.vacuumController.turnOn();
            setTimeout(() => {
                if (!this.player.isPlaying()) {
                    this.player.play();
                }
            }, waitForPump);
        } else {
            if (this.player.isPlaying()) {
                this.player.pause();
                this.vacuumController.turnOff();
                this.synthesizer.stop();
            }
        }
    }

    // Called from the client to change current song position
    setCurrentSongTime(percent) {
        if (!this.songLoaded) {
            return;
        }

        if (this.player.isPlaying()) {
            //console.log("skipping to " + percent);
            this.player.skipToPercent(percent);
            this.player.play();
        } else {
            this.player.skipToPercent(percent);
        }
    }

    resetKeys() {
        this.keys.fill(0);
        this.register.send(this.keys);
        this.sustainController.pedalOff();
        this.synthesizer.stop();
    }

    // Plays the next song in the internalPlaylist
    playNextSong(wasPlaying) {
        if (this.playlistMode && this.playlistIndex < this.internalPlaylist.length - 1) {
            this.playlistIndex++;
            let song = this.internalPlaylist[this.playlistIndex];
            console.log("Playing next song: ", song.title);
            this.setSong(song);
            if (wasPlaying) {
                this.play(true);
            }
        } else {
            this.vacuumController.turnOff();
        }
    }

    playPreviousSong(wasPlaying) {
        let song;
        console.log("Song was playing: " + wasPlaying);

        // Check if we're in playlist mode and at the beginning of the current song
        // then we'll go to the previous song.
        // Otherwise, just restart the current song.
        console.log("play previous. Current index = " + this.playlistIndex);
        if (this.playlistMode && this.currentSongTime - this.currentSongTimeRemaining < 10 && this.playlistIndex > 0) {
            this.playlistIndex--;
            song = this.internalPlaylist[this.playlistIndex];
        } else {
            song = this.currentSong;
        }

        console.log("Setting previous song: ", song.title);
        this.setSong(song);
        if (wasPlaying) {
            this.play(true);
        }
    }

    // This is called when a user starts playing from the playlist
    // Various states:
    //      The "Play" button is clicked from the playlist panel
    //            - This is the same as clicking the first item in the playlist
    //
    //      The user clicks on a song somewhere in the playlist
    //            - In this case, start playing at that index, but will play all the items
    //            - If not shuffling, then start at that point in the list.
    //
    //      The user clicks the "Shuffle" button
    //            - Ignore the index and begin playing a shuffled version of the list
    startPlaylist(shuffle, index) {
        // Stop any tests
        if (this.testInterval) {
            clearInterval(this.testInterval);
        }

        // Playlist is empty, so nothing to start
        if (this.playlist.length < 1) {
            return;
        }

        //console.log("playist: " + JSON.stringify(this.playlist));

        // First, make a copy of the playlist to use as the internal list
        // The copy is important, because we'll be popping the songs off the list until it is empty
        this.internalPlaylist = [...this.playlist];

        if (shuffle) {
            this.shuffleList(this.internalPlaylist);
        } else {
            // If we started playing the list somewhere in the middle,
            // then take off the elements at the front and add them to the end until
            // index is at the start.
            for (let i = 0; i < index; i++) {
                let temp = this.internalPlaylist.shift();
                this.internalPlaylist.push(temp);
            }
        }

        //console.log("internalPlaylist: " + JSON.stringify(this.internalPlaylist));

        // Put into playlist mode and start playing
        this.playlistMode = true;
        this.playlistIndex = 0;
        this.setSong(this.internalPlaylist[0]);
        this.play(true);
    }

    shuffleList(list) {
        for (let i = list.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
            [list[i], list[j]] = [list[j], list[i]];
        }
    }

    setSong(song) {
        // Stop any tests
        if (this.testInterval) {
            clearInterval(this.testInterval);
        }

        // Stop the player if it's playing
        if (this.player.isPlaying()) {
            this.player.stop();
        }

        // Reset all keys
        this.resetKeys();

        // Load the song MIDI file
        if (fs.existsSync(song.midi_path)) {
            this.currentSong = song;
            console.log("Received song: " + song.title);
            this.player.loadFile(song.midi_path);
            this.songLoaded = true;
            this.songEnded = false;
            let lastTick = 0;
            let channel = 1;
            let foundPiano = false;
            //let channels = [];//0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // Array of 16 possible channels (default to piano, 0)
            // Try to estimate the song length in ticks by finding the largest tick value
            this.player.tracks.forEach(function(track){
                //console.log(track.getStringData(1));
                track.events.forEach(function(event){
                    if(event.name && (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off")) {
                        if (event.tick > lastTick) {
                            lastTick = event.tick;
                        }
                    } else if (event.name && (event.name.toLowerCase() === "program change")
                        && event.channel !== 10 && event.value === 0) {

                        //channels[event.channel-1] = event.value; // Save the instrument name
                        //channels.push({channelNumber: event.channel, instrumentNumber: event.value});
                        channel = event.channel;
                        foundPiano = true;
                        console.log("Found piano: " + JSON.stringify(event));
                    }
                });
            });
            if (!foundPiano) {
                console.log("No piano channel found.");
            }
            this.pianoChannel = channel;
            //console.log(JSON.stringify(channels));
            //this.io.to('note players').emit('load channel instruments', channels);
            this.currentSongTotalTicks = lastTick;
            //this.currentSongTotalTicks = this.player.getTotalTicks(); // Doesn't seem to work
            this.currentSongTime = this.player.getSongTime();
            this.currentSongTimeRemaining = this.currentSongTime;
            console.log("Song length: " + this.player.getSongTime() + ", Song Total Ticks: " + this.currentSongTotalTicks);
        } else {
            console.log ("Received invalid song path: " + song.midi_path);
        }
    }

    // =====================================================
    // Key Test Functions
    // =====================================================
    // Stop test that is currently playing
    stopTests() {
        this.resetKeys();
        if (!this.underTest)
            return;

        if (this.testInterval) {
            clearInterval(this.testInterval);
        }
        this.vacuumController.turnOff();
        this.underTest = false;
    }

    runKeyTest(keyTest, delay) {
        if (keyTest != 5) {
            // Don't call this for the toggle on/off test so more than one key can be toggled at a time
            this.stopTests();
        }
        this.underTest = true;

        console.log("Running Test #" + keyTest + ": delay = " + delay + ", key = " + this.testKey);

        // If the vacuum pump is off, wait 2 seconds for it to spin up
        let waitForPump = this.vacuumController.isOn() ? 0 : 2000;
        this.vacuumController.turnOn();
        this.keyIndex = 0;

        // The key test interval shouldn't be less than 100ms. It's unlikely the keys can react that quickly.
        // Anything over 1 second is too long
        let testDelay = delay >= 100 && delay <=1000 ? delay : KEY_TEST_DELAY;

        setTimeout(() => {
            // Run the specified test
            switch (keyTest) {
                // All keys pressed and released, one at a time
                case 0:
                    this.testInterval = setInterval(this.testEachKey.bind(this), testDelay);
                    break;

                // All keys pressed and held, one at a time
                case 1:
                    this.testInterval = setInterval(this.testAllKeys.bind(this), testDelay);
                    break;

                // Each key pressed 5 times rapidly, one at a time
                // This helps calibrate and test how quickly each key can recover between presses
                case 2:
                    this.testInterval = setInterval(this.testEachKeyRapidly.bind(this), testDelay);
                    break;

                // Each key pressed and held, then pressed again while held
                // This simulates a condition where two tracks are playing and the same key is struck
                case 3:
                    this.testInterval = setInterval(this.testEachKeyOverlapping.bind(this), testDelay);
                    break;

                // Test one single key
                // Runs a single key through a variety of tests
                case 4:
                    this.testInterval = setInterval(this.testSingleKey.bind(this), testDelay);
                    break;

                // Toggle on or off a single key
                case 5:
                    this.toggleSingleKey();
                    break;

                default:
                    this.vacuumController.turnOff();
                    this.underTest = false;
                    break;
            }
        }, waitForPump);
    }

    toggleSingleKey() {
        if (this.testKey < 0 || this.testKey >= this.numKeys) {
            this.stopTests();
            return;
        }

        this.keys[this.testKey] = (this.keys[this.testKey] ? 0 : 1);
        console.log("Testing key #" + this.testKey + ", turning " + (this.keys[this.testKey] ? "on." : "off."));
        this.register.send(this.keys);

        // Check if all keys are off
        let keyOn = false;
        for (let i = 0; i < this.numKeys; i++)
        {
            if (this.keys[i]) {
                keyOn = true;
            }
        }
        if (!keyOn) {
            console.log("All keys off, turning off vacuum.");
            this.stopTests();
        }
    }

    // Runs a single key (this.testKey) through 3 tests:
    // 1) Just press and hold (iterations 0-9)
    // 2) Press in quick succession 5 times (iterations 20 - 29)
    // 3) Press an hold then press it again 3 times (iterations 40 - 50)
    testSingleKey() {
        //let millis = Date.now();

        if (this.keyIndex > 50 || this.testKey < 0 || this.testKey >= this.numKeys) {
            this.vacuumController.turnOff();
            this.underTest = false;
            clearInterval(this.testInterval);
            return;
        }

        switch (this.keyIndex) {
            case 0:       // Start of test #1
            case 20:      // Start of test #2
            case 22:
            case 24:
            case 26:
            case 28:
            case 40:      // Start of test #3
            case 44:
            case 46:
            case 48:
                this.keys[this.testKey] = 1;
                break;
            case 10:      // End of test #1
            case 21:
            case 23:
            case 25:
            case 27:
            case 29:      // End of test #2
            case 50:      // End of test #3
                this.keys[this.testKey] = 0;
                break;
        }

        this.keyIndex++;
        this.register.send(this.keys);
    }

    // Simply press each key in succession
    testEachKey() {
        if (this.keyIndex >= this.numKeys) {
            this.vacuumController.turnOff();
            this.underTest = false;
            clearInterval(this.testInterval);
            return;
        }

        //console.log("Testing key: " + this.keyIndex);

        this.keys[this.keyIndex] = 1;
        if (this.keyIndex > 0) {
            this.keys[this.keyIndex - 1] = 0;
        }

        this.keyIndex++;
        //console.log(JSON.stringify(this.keys));
        this.register.send(this.keys);
    }

    // Press each key on and off 5 times in quick succession
    testEachKeyRapidly() {
        let millis = Date.now();

        let key = Math.floor(this.keyIndex / 10);
        if (key >= this.numKeys) {
            this.vacuumController.turnOff();
            this.underTest = false;
            clearInterval(this.testInterval);
            return;
        }

        if (key > 0) {
            this.keys[key-1] = 0;
        }

        // Turn key on for odd, off for even
        if (this.keyIndex % 2 === 1) {
            this.keys[key] = 1;
        } else {
            this.keys[key] = 0;
        }

        this.keyIndex++;
        this.register.send(this.keys);
    }

    // Press a key, then press it again without calling off()
    testEachKeyOverlapping() {
        let millis = Date.now();

        let key = Math.floor(this.keyIndex / 10);
        if (key >= this.numKeys) {
            this.vacuumController.turnOff();
            this.underTest = false;
            clearInterval(this.testInterval);
            return;
        }

        // If this is the first or 5th iteration for this key, press it
        if (this.keyIndex % 5 === 0) {
            this.keys[key] = 1;
        }

        // If this is the 1st iteration for this key, release the previous key
        if (this.keyIndex % 10 === 0 && key > 0) {
            this.keys[key-1] = 0;
        }

        this.keyIndex++;
        this.register.send(this.keys);
    }

    // This just keeps pressing all the keys without releasing them
    testAllKeys() {
        this.keys[this.keyIndex] = 1;
        if (this.keyIndex >= this.numKeys) {
            this.vacuumController.turnOff();
            this.underTest = false;
            clearInterval(this.testInterval);
        }

        this.keyIndex++;
        this.register.send(this.keys);
    }
}

module.exports = PianoServer;
