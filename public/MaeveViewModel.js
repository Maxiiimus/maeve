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

// ========================================================================================================
// This is the ModelView for the data driving the UI it also receives updates from the server via Socket.IO
// ========================================================================================================
function MaeveViewModel() {
    let self = this;
    self.socket = io();

    self.callStart = 0; // variable to test roundtrip call

    // Placeholder text when there is no currentSong from the server yet
    let welcomeSong = new Song({song_id: -1, title: "Hello Darling", artist: "Maeve",
        midi_path: "", image_path: "images/artists/Welcome Image.png"});
    self.currentSong = ko.observable(welcomeSong);

    self.timePlayedString = ko.observable("");
    self.timeRemainingString = ko.observable("");

    self.audioOn = ko.observable(false);
    self.pianoOn = ko.observable(true);
    self.synthOn = ko.observable(true);
    self.synthPianoOn = ko.observable(false);
    self.isPlaying = ko.observable(false);
    self.volume = ko.observable(5);

    self.library = ko.observableArray([]);

    self.playlists = ko.observableArray([]);
    self.selectedPlaylist = ko.observable();
    self.selectedPlaylist.subscribe(function() {
        self.selectPlaylist();
    });

    self.currentPlaylistID = -1; // Keep track of current playlistID. -1 means first load
    self.playlist = ko.observableArray([]);
    self.playlistNameEditText = ko.observable("");

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
        // Implement event handler for when the timeslider stops
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

        // Adjust the synth volume. Values are 0 - 200, which correlates to 0.0 - 2.0 for FluidSynth
        $("#volumeslider").on("slidestop", () => {
            let val =  $("#volumeslider").val();
            self.volume(val);
            //console.log("Volume = " + self.volume());
            self.socket.emit("set volume", val);
        });
    });

    // =========================================================================
    // Operations
    // =========================================================================

    self.setSongTime = function(val) {
        //let val =  $("#timeslider").val();
        console.log ("slider = " + val);
        self.socket.emit("set time", val);
    };

    // Create a new playlist
    self.createPlaylist = function() {
        let name = $("#createPlaylistNameInput").val().trim();
        if (name === "") {
            self.toast("Playlist name cannot be empty.");
        } else {
            self.socket.emit("create playlist", name);
            console.log("New playlist created named " + name);
            self.toast("\"" + name + "\" created.");
            $("#createPlaylistNameInput").val("");
            $("#popupCreatePlaylist").popup("close");
        }
    };

    self.openDeletePlaylistPopup = function() {
        let playlistID = $("#selectPlaylist").val();
        if (playlistID == 1) { // We don't want === (strict) equality check
            self.toast("The playlist '" + $("#selectPlaylist").find(":selected").text() + "' cannot be deleted.");
        } else {
            $("#popupDeletePlaylist").popup("open");
        }
    };

    // Create a new playlist (basically, just empty the current list and popup the name dialog)
    self.deletePlaylist = function() {
        $("#popupDeletePlaylist").popup("close");
        let playlistID = $("#selectPlaylist").val();
        let playlistName = $("#selectPlaylist").find(":selected").text();

        console.log("Deleting playlist: " + playlistName);

        // Cannot delete the first playlist
        if (playlistID == 1) { // We don't want === (strict) equality check
            self.toast("The playlist '" + playlistName + "' cannot be deleted.");
        } else {
            // Delete the playlist
            self.toast("Deleting playlist '" + playlistName + "'.");
            self.socket.emit('delete playlist');
        }
    };

    self.openPlaylistPopup = function() {
        self.playlistNameEditText($("#selectPlaylist").find(":selected").text());
        //self.playlistNameEditText(self.selectedPlaylist().name);
        console.log("self.playlistNameEditText() = " + self.playlistNameEditText());
        //console.log("self.selectedPlaylist().name = " + self.selectedPlaylist().name);

        //$("#editPlaylistNameInput").textContent("refresh");
        $("#popupEditPlaylist").popup("open");
    };

    // Update the name of the current playlist
    self.renamePlaylistName = function() {
        let oldName = $("#selectPlaylist").find(":selected").text();
        let newName = $("#editPlaylistNameInput").val().trim();

        if (newName === "") {
            self.toast("Playlist name cannot be empty.");
        } else if (newName !== oldName) {
            console.log("Renaming '" + oldName + "' to '" + newName + "'");
            self.toast("\"" + oldName + "\" renamed.");

            // If we have an existing playlist, then just rename it
            self.socket.emit('rename playlist', newName);
        }

        $("#popupEditPlaylist").popup("close");
    };

    self.selectPlaylist = function() {
        // If currentPlaylistID is -1, then we don't want to do anything because it's the first load
        // The server will call and tell the client which playlist to select when the client connects.
        if (self.currentPlaylistID != -1) {
            console.log("Switching to playlist: " + $("#selectPlaylist").val());
            self.socket.emit('select playlist', $("#selectPlaylist").val());
        }
    };

    // Adds a song from the library to the current playlist
    self.addSongToPlaylist = function(song) {
        // Call the server to add the selected song to the current playlist
        self.socket.emit('add to playlist', song.song_id);
        console.log("Adding song to playlist: " + song.title);
        self.toast("\"" + song.title + "\" added to playlist.");
    };

    // Removes the selected song from the playlist
    self.removeSongFromPlaylist = function(playlistSong) {
        //console.log("removing song: " + JSON.stringify(playlistSong));
        self.socket.emit('remove from playlist', playlistSong.item_id);
        self.toast("\"" + playlistSong.title + "\" removed.");
    };

    // Plays a specified song
    self.playSong = function(song) {
        console.log("Playing song: " + song.title);
        self.currentSong(song);
        $("#searchpanel").panel( "close" ); // Songs can played from the search panel, so dismiss it
        self.socket.emit('play song', song);
    };

    // Starts playing the playlist. Called by either clicking on song in the playlist (index)
    // or by the "play" button on the playlist panel (same as index = 0)
    self.playPlaylist = function(index) {
        //console.log("playPlaylist() called with index = " + index);
        $("#box").animate({'bottom': '-100%'}, 300) // Dismiss the panel when starting to play
        self.socket.emit('play playlist', false, index);
    };

    // Starts playing the playlist. Called by either clicking on song in the playlist (index)
    // or by the "play" button on the playlist panel (same as index = 0)
    self.shufflePlaylist = function() {
        //console.log("shufflePlaylist() called.");
        $( "#box").animate({'bottom': '-100%'}, 300) // Dismiss the panel when starting to play
        self.socket.emit('play playlist', true, 0); // Index will be ignored
    };

    self.previous = function() {
        console.log("Previous song");
        self.socket.emit('previous song');
    };

    self.play = function() {
        self.isPlaying(true);
        console.log("Playing");
        self.socket.emit('toggle play', true);
    };

    self.pause = function() {
        self.isPlaying(false);
        console.log("Pausing");
        self.socket.emit('toggle play', false);
    };

    self.next = function() {
        self.isPlaying(true);
        console.log("Next song");
        self.socket.emit('next song');
    };

    self.reloadLibrary = function() {
        self.socket.emit('reload library');
        $("#optionspanel").panel( "close" );
    };

    self.testKeys = function(testNumber) {
        self.isPlaying(false);
        // Get the test speed interval
        let interval = parseInt($("#text-interval").val());
        if (!interval) {
            interval = 250;
        }
        //console.log("interval = " + interval);

        let noteNumber = parseInt($("#select-key").val());
        if (!noteNumber) {
            noteNumber = 0;
        }
        //console.log("note = " + noteNumber);

        $("#optionspanel").panel( "close" ); // Songs can played from the search panel, so dismiss it
        self.socket.emit('run test', testNumber, noteNumber, interval);
    };

    self.testRoundTrip = function() {
        // Output time to the console:
        self.callStart = Date.now()
        console.log("Current time: " + self.callStart);
        self.socket.emit('test roundtrip', self.callStart);
    }

    self.togglePiano = function() {
        // Output time to the console:
        //console.log("Toggling piano to: " + self.pianoOn());
        self.socket.emit('toggle piano', self.pianoOn());
    }

    self.toggleSynth = function() {
        // Output time to the console:
        //console.log("Toggling piano to: " + self.pianoOn());
        self.socket.emit('toggle synth', self.synthOn());
    }

    self.toggleSynthPiano = function() {
        // Output time to the console:
        console.log("Toggling synth piano to: " + self.synthPianoOn());
        self.socket.emit('toggle synth piano', self.synthPianoOn());
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
    self.socket.on('load library', function (allSongs) {
        let sortedSongs = self.sortJSON(allSongs,'artist'); // sort by artist
        //console.log(sortedSongs);
        let mappedSongs = $.map(sortedSongs, function(item) { return new Song(item) });
        self.library(mappedSongs);
        $("#songlist").listview( "refresh" );
        //console.log("loaded songs into library: " + self.library().length);
    });

    // "load playlists" is called when a client connects to provide the list of playlists
    self.socket.on('load playlists', function (allPlaylists, selectedPlaylistID) {
        self.playlists(allPlaylists);

        self.currentPlaylistID = selectedPlaylistID;
        $("#selectPlaylist").val(selectedPlaylistID).trigger('change');
        $("#selectPlaylist").selectmenu("refresh", true);
    });

    // "update playlist name" is called to rename the current selected playlist name
    // This is different than 'load playlists' since this keeps the current playlist selected.
    self.socket.on('update playlist name', function (name) {
        let playlist = document.getElementById("selectPlaylist");
        playlist.options[playlist.selectedIndex].text = name;
        $("#selectPlaylist").selectmenu( "refresh", true );
    });

    // "set song" is called to update the client with the current song that is playing
    self.socket.on('set song', function (song) {
        if (song.song_id === self.currentSong.song_id) return; // If we're already playing the song, just return
        self.currentSong(song);
    });

    // "update playlist" called to update the current playlist
    self.socket.on('update playlist', function (playlistSongs, selectedPlaylistID) {
        let playlist = playlistSongs;
        let mappedSongs = $.map(playlist, function(item) { return new Song(item) });

        //console.log("updating playlist: " + JSON.stringify(playlist));
        // Select the correct playlist (in case this is called because it was changed)
        if (self.currentPlaylistID != selectedPlaylistID) {
            self.currentPlaylistID = selectedPlaylistID;
            $("#selectPlaylist").val(selectedPlaylistID).trigger('change');
        }

        // Update the playlist songs
        self.playlist(mappedSongs);
        $("#playlist").listview( "refresh", true);
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

    self.socket.on('roundtrip return', function(startTime) {
        let callEnd = Date.now();
        console.log("End time: " + callEnd);
        console.log("Round trip ms: " + (callEnd - self.callStart));
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
