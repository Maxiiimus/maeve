const MidiPlayer = require('midi-player-js');
const songLibrary = require('../midis/song-list');
const fs = require('fs');

const CLIENT_INTERVAL = 250; // milliseconds between updates to client if needed
//const SONG_PAUSE = 2000; // How long to pause before starting the next song
const KEY_TEST_DELAY = 250; // The delay between playing each key during the tests

// This is used by the 'endOfFile' MidiPlayer event
let songEnded = false;

class PianoServer {
    constructor() {
        //this.app = express();
        //this.server = http.createServer(this.app);

        //this.register = register; //new KeyRegister(SER_Pin, SRCK_Pin, RCK_Pin, SRCLR_PIN);
        //this.keys = Buffer.alloc(NUM_MODULES * REGISTER_SIZE).fill(0);
        //this.numKeys = register.moduleCount * register.registerSize;
        //this.keys = Buffer.alloc(this.numKeys).fill(0);
        this.keyIndex = 0;

        this.currentSong = {
            id: -1,
            title: "Hello Darling",
            artist: "Maeve",
            path: "",
            image: "images/artists/Welcome Image.png"
        };

        // This is the current playlist or queue. Currently, there is just one
        // This is the playlist that appears in the UI
        this.playlist = [];

        // This is actual internal list that is used for playing
        // It is randomized if shuffle is enabled. It is also recreated if repeat is enabled.
        // If a song is added to the queue while playing, it is added to this list too
        this.internalPlaylist = [];
        //this.randomizedPlaylist = [];
        this.playlistChanged = false;
        this.playlistMode = false;
        //this.isPlaying = false;
        this.playlistIndex = 0;

        this.currentSongTime = 0;
        this.currentSongTimeRemaining = 0;
        this.currentSongTotalTicks = 0;
        this.songLoaded = false;
        //this.songEnded = false;
        this.clientsConnected = false;
    }

    start (http, io, port, register) {
        this.register = register;
        this.numKeys = register.moduleCount * register.registerSize;
        this.keys = Buffer.alloc(this.numKeys).fill(0);

        // Open connection to clients
        this.io = io; //require('socket.io')(server);
        this.listen(http, port);

        // Start up the player
        this.player = this.initializePlayer();

        // Update the clients every 250ms
        setInterval(this.updateClients.bind(this), CLIENT_INTERVAL);
    }

    initializePlayer() {
        // Initialize player and register event handler
        let p = new MidiPlayer.Player( (event) => {
            let keyIndex = 21;
            let keyVal = 0; // Default to "Note off" with a 0

            // When we get a "Note on" or "Note off" event, update the values in the shift register
            // Also, update the clients in case they are playing the audio locally
            if (event.name && (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off")) {

                // "Note off" is also represented as a velocity of 0
                // So, we default to 0, but change the value if velocity is not 0
                if (event.velocity !== 0) {
                    keyVal = 1;
                }
                //console.log(JSON.stringify(event));
                keyIndex = event.noteNumber - 21; // Piano key midi notes start at 21
                this.keys[keyIndex] = keyVal;
                this.register.send(this.keys);
                //this.io.emit('update keys', JSON.stringify(this.keys));

                // Calculate time remaining using the current tick
                let remainingTicks = this.currentSongTotalTicks - event.tick;
                this.currentSongTimeRemaining = Math.floor(remainingTicks / this.currentSongTotalTicks * this.currentSongTime);
            }
        });

        // Listen for the end of a file
        p.on('endOfFile', function() {
            console.log("End of file reached");
            songEnded = true;
            //io.emit('song over');
        });

        return (p);
    }

    listen(http, port) {
        this.io.on('connection', (socket) => {
            this.clientsConnected = true;
            console.log('a user connected');

            this.io.emit('load library', songLibrary.songs); //JSON.stringify(songLibrary));
            this.io.emit('update playlist', this.playlist);

            socket.on("test each key", () => {
                this.runEachKeyTest();
            });

            socket.on("test all keys", () => {
                this.runAllKeysTest();
            });

            socket.on("stop tests", () => {
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
                this.play(shouldPlay);
            });

            socket.on("previous song", () => {
                console.log("Previous song");
                this.playPreviousSong();
            });

            socket.on("next song", () => {
                console.log("Next song");
                this.playNextSong();
            });

            socket.on("set time", (percent) => {
                this.setCurrentSongTime(percent);
            });

            socket.on("test each key", () => {
                console.log("test each key");
                this.runEachKeyTest();
            });

            socket.on("test all keys", () => {
                console.log("test all keys");
                this.runAllKeysTest();
            });

            /*
            socket.on('update key', (id, keyState) => {
                if (id >= 0 && id <= this.keys.length) {
                    this.keys[id] = keyState;
                    this.io.emit('update keys', JSON.stringify(this.keys));
                    console.log('Updated keys[' + id + ']' + ": " + keyState);
                    this.register.send(this.keys);
                }
            });
            */

            socket.on('update playlist',  (p) => {
                console.log('incoming playlist: ' + p);
                this.playlist = p;
                this.playlistChanged = true; // Update all connected clients' playlist
                //this.createRandomizedPlaylist();
                //io.emit('update playlist', JSON.stringify(p));
                //io.emit('update switches', JSON.stringify(keys));
            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });

        http.listen(port, () => {
            console.log("Running server on port %s", port);
        });
    }

    // Set an interval to update all connected clients
    updateClients() {
        // If a song has ended and we're playing a playlist, then play the next song
        //if (songEnded && this.isPlaying && this.playlistMode) {
        if (songEnded && this.playlistMode) {
            this.playNextSong();
            //songEnded = false;
        }

        // Only update client playlist if it's changed
        if (this.playlistChanged) {
            if (this.clientsConnected) {
                this.io.emit('update playlist', this.playlist);
            }
            this.playlistChanged = false;
        }

        // Let the clients know what song is playing, update time and settings
        if (this.clientsConnected) {
            //this.io.emit("set song", this.currentSong);
            //this.io.emit("update time", this.currentSongTime, this.currentSongTimeRemaining);
            //console.log("Updating song to clients: " + this.currentSong.title);
            //this.io.emit("update song", this.currentSong, this.isPlaying,
            this.io.emit("update song", this.currentSong, this.player.isPlaying(),
                this.currentSongTime, this.currentSongTimeRemaining);
            //this.io.emit("settings", this.playlistRepeat, this.playlistRandom);
        }
    }

    // play() - plays or pauses the current song
    play(shouldPlay) {
        // This stops any tests that might be running
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }

        // If there is no song loaded, no point in playing or pausing
        if (!this.songLoaded) {
            //this.isPlaying = false;
            return;
        }

        if (shouldPlay) {
            //if (!this.isPlaying) {
            if (!this.player.isPlaying()) {
                this.player.play();
            }
        } else {
            //if (this.isPlaying) {
            if (this.player.isPlaying()) {
                this.player.pause();
            }
        }
        //this.isPlaying = shouldPlay;
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

    /*
    playMusic() {
        if(!this.isPlaying) {
            // Check if a song has been loaded, if pick a random song to load
            if (!this.songLoaded) {
                let i = Math.floor(Math.random() * Math.floor(songLibrary.songs.length));
                this.currentSongId = songLibrary.songs[i].id;
                this.setSong(this.currentSong);
            }
            this.player.play();
        }
        this.isPlaying = true;
    }

    pauseMusic() {
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }
        this.player.pause();

        this.isPlaying = false;
    }*/

    resetKeys() {
        this.keys.fill(0);
        this.register.send(this.keys);
    }

    // If random (shuffle) is enabled, then need to create a random ordered playlist to play from
    /*createRandomizedPlaylist() {
        if (!this.playlist || this.playlist.length < 1) return;

        // First, copy the playlist
        let temp = [...this.playlist];
        this.randomizedPlaylist = [];

        // Next copy one at a time at random
        for (let i = 0; i < this.playlist.length; i++) {
            let j = Math.floor(Math.random() * temp.length);
            console.log("Pushing position: " + j);
            this.randomizedPlaylist.push(temp.splice(j,1));
        }

        if (this.playlistRandom) {
            // If playing a random playlist, then reset the index to start over.
            this.currentPlaylistIndex = 0;
        }
        console.log("Playlist.length = " + this.playlist.length + " Randomized list length: " + this.randomizedPlaylist.length);
        console.log("Playlist: " + JSON.stringify(this.playlist));
        console.log("Randomized: " + JSON.stringify(this.randomizedPlaylist));
    }*/

    /*
    updateSettings(playRandom, playRepeat) {
        // Check if the random setting has changed and if so, create a randomized playlist
        if (playRandom != this.playlistRandom) {
            this.playlistRandom = playRandom;

            // Recreate the random playlist
            if (this.playlistRandom) {
                this.createRandomizedPlaylist();
            }
        }
        this.playlistRepeat = playRepeat;
    }*/

    /*
    updateSettings(settings) {
        this.settings = JSON.parse(settings);
        // Check if the random setting has changed and if so, create a randomized playlist
        if (playRandom != this.playlistRandom) {
            this.playlistRandom = playRandom;

            // Recreate the random playlist
            if (this.playlistRandom) {
                this.createRandomizedPlaylist();
            }
        }
        this.playlistRepeat = playRepeat;
    }*/

    // Plays the next song in the internalPlaylist
    playNextSong() {
        if (this.playlistMode && this.playlistIndex < this.internalPlaylist.length - 1) {
            this.playlistIndex++;
            console.log("playing next song: " + this.playlistIndex);
            let song = this.internalPlaylist[this.playlistIndex];
            console.log("Playing next song: ", song.title);
            this.setSong(song);
            this.play(true);
        }
    }

    playPreviousSong() {
        let song;
        // Check if we're in playlist mode and at the beginning of the current song
        // then we'll go to the previous song.
        // Otherwise, just restart the current song.
        console.log("play previous. Current index = " + this.playlistIndex);
        console.log("current song time = " + this.currentSongTime - this.currentSongTimeRemaining);
        if (this.playlistMode && this.currentSongTime - this.currentSongTimeRemaining < 10 && this.playlistIndex > 0) {
            this.playlistIndex--;
            song = this.internalPlaylist[this.playlistIndex];
        } else {
            song = this.currentSong;
        }

        console.log("Playing previous song: ", song.title);
        this.setSong(song);
        this.play(true);
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
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }

        // Playlist is empty, so nothing to start
        if (this.playlist.length < 1) {
            return;
        }

        console.log("playist: " + JSON.stringify(this.playlist));

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

        console.log("internalPlaylist: " + JSON.stringify(this.internalPlaylist));

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
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }

        // Reset all keys
        this.resetKeys();

        //let song = songLibrary.songs.find( el => el.id === Number.parseInt(song_id));
        //console.log("Playing Song: " + song["title"]);

        // Load a MIDI file
        if (this.player.isPlaying()) {
            this.player.stop();
        }

        if (fs.existsSync(song.path)) {
            this.currentSong = song;
            console.log("Received song: " + this.currentSong.title);
            this.player.loadFile(song.path);
            this.songLoaded = true;
            songEnded = false;
            let lastTick = 0;
            // Try to estimate the song length in ticks by finding the largest tick value
            this.player.tracks.forEach(function(track){
                track.events.forEach(function(event){
                    if(event.name && (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off")) {
                        if (event.tick > lastTick) {
                            lastTick = event.tick;
                        }
                    }
                });
            });
            this.currentSongTotalTicks = lastTick;
            //this.currentSongTotalTicks = this.player.getTotalTicks(); // Doesn't seem to work
            this.currentSongTime = this.player.getSongTime();
            this.currentSongTimeRemaining = this.currentSongTime;
            console.log("Song length: " + this.player.getSongTime() + ", Song Total Ticks: " + this.currentSongTotalTicks);
        } else {
            console.log ("Received invalid song path: " + song.path);
        }
    }

    // =====================================================
    // Key Test Functions
    // =====================================================
    runEachKeyTest() {
        this.keyIndex = 0;
        this.keys.fill(0);
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }
        this.myInterval = setInterval(this.testEachKey.bind(this), KEY_TEST_DELAY);
    }

    testEachKey() {
        this.keys[this.keyIndex] = 1;
        if (this.keyIndex > 0) {
            this.keys[this.keyIndex-1] = 0;
        }
        if (this.keyIndex >= this.numKeys) {
            clearInterval(this.myInterval);
        }
        this.register.send(this.keys);
        this.io.emit('update keys', JSON.stringify(this.keys));
        //console.log("Keys: " + JSON.stringify(keys));
        this.keyIndex++;
    }

    runAllKeysTest() {
        this.keyIndex = 0;
        this.keys.fill(0);
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }
        this.myInterval = setInterval(this.testAllKeys.bind(this), KEY_TEST_DELAY);
    }

    testAllKeys() {
        this.keys[this.keyIndex] = 1;

        if (this.keyIndex >= this.numKeys) {
            this.register.send(this.keys);
            this.io.emit('update keys', JSON.stringify(this.keys));
            clearInterval(this.myInterval);
        }
        this.register.send(this.keys);
        this.io.emit('update keys', JSON.stringify(this.keys));
        this.keyIndex++;
    }

    stopTests() {
        if (this.myInterval) {
            clearInterval(this.myInterval);
        }
        this.player.stop();

        this.keys.fill(0);
        this.register.send(this.keys);
        this.io.emit('update keys', JSON.stringify(this.keys));
    }
    //getApp() {
    //    return this.app;
    //}
}

module.exports = PianoServer;
