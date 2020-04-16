// Class to represent a single song
function Song(data) {
    let self = this;
    self.id = data.id;
    self.title = data.title;
    self.artist = data.artist;
    self.path = data.path;
    self.image = data.image;
}

// ========================================================================================================
// This is the ModelView for the data driving the UI it also receives updates from the server via Socket.IO
// ========================================================================================================
function MaeveViewModel() {
    let self = this;
    let socket = io();

    //let ac = new AudioContext();
    // This is used to hear audio playing on the client. Useful for testing, but doesn't sound great
    //self.piano = null;
    //Soundfont.instrument(ac, 'acoustic_grand_piano').then(function (p) {
    //    self.piano = p;
    //});

    // Placeholder text when there is no currentSong from the server yet
    let welcomeSong = new Song({id: -1, title: "Hello Darling", artist: "Maeve",
        path: "", image: "images/artists/Welcome Image.png"});
    self.currentSong = ko.observable(welcomeSong);

    self.timePlayedString = ko.observable("");
    self.timeRemainingString = ko.observable("");

    self.audioOn = ko.observable(false);
    self.isPlaying = ko.observable(false);

    self.library = ko.observableArray([]);
    self.playlist = ko.observableArray([]);

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

    self.pauseSliderMoves = false;
    $(function () {
        // Implement event hanlder for when the timeslider stops
        // This way we only call the server after the drag is done.
        $("#timeslider").on("slidestop", () => {
            let val =  $("#timeslider").val();
            self.setSongTime(val);
            self.pauseSliderMoves = false;
        });

        // If the user starts moving the slider, then pause the adjusting from the server
        // until the user stops sliding
        $("#timeslider").on("slidestart", () => {
            self.pauseSliderMoves = true;
        });
    });

    // =========================================================================
    // Operations
    // =========================================================================

    self.setSongTime = function(val) {
        //let val =  $("#timeslider").val();
        console.log ("slider = " + val);
        socket.emit("set time", val);
    }

    // Adds a song from the library to the current playlist
    self.addSongToPlaylist = function(song) {
        let songCopy = {...song}; // copy the song so there could be duplicates in a playlist
        console.log("adding song to playlist: " + songCopy.title);
        self.playlist.push(songCopy);
        $("#playlist").listview( "refresh" ); // Refresh updates the CSS for the elements
        console.log("Sending playlist to server: " + self.playlist());
        socket.emit('update playlist', self.playlist());  // Update the server with the playlist change
        self.toast("\"" + song.title + "\" added to playlist.");
    };

    // Removes the selected song from the playlist
    self.removeSongFromPlaylist = function(song) {
        console.log("Removing song: " + song.id);
        self.toast("\"" + song.title + "\" removed.");
        self.playlist.remove(song);
        socket.emit('update playlist', self.playlist());  // Update the server with the playlist change
    };

    // Plays a specified song
    self.playSong = function(song) {
        console.log("Playing song: " + song.title);
        socket.emit('set song', song);
        self.currentSong(song);
        $("#searchpanel").panel( "close" ); // Songs can played from the search panel, so dismiss it
        console.log("Calling play song: " + song.title);
        socket.emit('play song', song);
    };

    // Starts playing the playlist. Called by either clicking on song in the playlist (index)
    // or by the "play" button on the playlist panel (same as index = 0)
    self.playPlaylist = function(index) {
        console.log("playPlaylist() called with index = " + index);
        $( "#box").animate({'bottom': '-100%'}, 300) // Dismiss the panel when starting to play
        socket.emit('play playlist', false, index);
    };

    // Starts playing the playlist. Called by either clicking on song in the playlist (index)
    // or by the "play" button on the playlist panel (same as index = 0)
    self.shufflePlaylist = function() {
        console.log("shufflePlaylist() called.");
        $( "#box").animate({'bottom': '-100%'}, 300) // Dismiss the panel when starting to play
        socket.emit('play playlist', true, 0); // Index will be ignored
    };

    self.previous = function() {
        console.log("Previous song");
        socket.emit('previous song');
    };

    self.play = function() {
        self.isPlaying(true);
        console.log("Playing");
        socket.emit('toggle play', true);
    };

    self.pause = function() {
        self.isPlaying(false);
        console.log("Pausing");
        socket.emit('toggle play', false);
    };

    self.next = function() {
        self.isPlaying(true);
        console.log("Next song");
        socket.emit('next song');
    };

    self.testEachKey = function() {
        self.isPlaying(false);
        $("#optionspanel").panel( "close" ); // Songs can played from the search panel, so dismiss it
        socket.emit('test each key');
    }

    self.testAllKeys = function() {
        self.isPlaying(false);
        $("#optionspanel").panel( "close" ); // Songs can played from the search panel, so dismiss it
        socket.emit('test all keys');
    }

    // =========================================================================
    // Helper functions
    // =========================================================================

    // Simple sort function to sort the library of songs
    self.sortJSON = function(data, key) {
        return data.sort(function(a, b) {
            let x = a[key]; let y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    // This is lazy to put here. It shouldn't be in the model, but for now easiest to add here
    self.toast = function(msg) {
        console.log("called toast: " + msg);
        $("<div class='ui-loader ui-body-a ui-corner-all'><h3>"+msg+"</h3></div>")
            .css({ display: "block",
                opacity: 0.90,
                position: "fixed",
                padding: "7px",
                "text-align": "center",
                width: "270px",
                left: ($(window).width() - 284)/2,
                top: $(window).height()/2 })
            .appendTo( $.mobile.pageContainer ).delay( 1500 )
            .fadeOut( 400, function(){
                $(self).remove();
            });
    };

    // Converts time in seconds to a minutes:seconds string
    self.getTimeString = function(time) {
        let minutes = Math.floor(time / 60.0);
        let seconds = Math.floor(time - minutes * 60);
        return(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds));
    };

    // =========================================================================
    // Socket.IO communication from the server
    // =========================================================================

    // "load library" is called when a client connects to provide the library of available songs
    socket.on('load library', function (allSongs) {
        let sortedSongs = self.sortJSON(allSongs,'artist'); // sort by artist
        //console.log(sortedSongs);
        let mappedSongs = $.map(sortedSongs, function(item) { return new Song(item) });
        self.library(mappedSongs);
        $("#songlist").listview( "refresh" );
        //console.log("loaded songs into library: " + self.library().length);
    });

    // "set song" is called to update the client with the current song that is playing
    socket.on('set song', function (song) {
        if (song.id === self.currentSong.id) return; // If we're already playing the song, just return
        self.currentSong(song);
    });

    // "update playlist" called to update the current playlist
    socket.on('update playlist', function (playlistSongs) {
        let playlist = playlistSongs;
        let mappedSongs = $.map(playlist, function(item) { return new Song(item) });
        self.playlist(mappedSongs);
        $("#playlist").listview( "refresh" );
    });

    // "update song" is called to update the total song time and the time left
    socket.on('update song', function (song, isPlaying, songTime, timeRemaining) {
        if (song.id !== self.currentSong.id) {
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

    // Method: 'update keys'
    //
    // incoming_keys: A buffer array representing the on/off state for each key
    /*
    socket.on('update keys', function (incoming_keys) {
        console.log("update keys: audioOn = " + self.audioOn());
        if (!self.audioOn() || !self.piano) return;
        let keys = JSON.parse(incoming_keys).data;

        for (let i = 0; i < 88; i++) {
            if (keys[i]) {
                self.piano.play(i + 21);
            }
        }
    });
     */
}

// Activates knockout.js
ko.applyBindings(new MaeveViewModel());
