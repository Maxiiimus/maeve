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
function GameViewModel() {
    let self = this;
    self.socket = io();

    // Placeholder text when there is no currentSong from the server yet
    let welcomeSong = new Song({id: -1, title: "Hello Darling", artist: "Maeve",
        path: "", image: "images/artists/Welcome Image.png"});
    self.currentSong = ko.observable(welcomeSong);

    self.timePlayedString = ko.observable("");
    self.timeRemainingString = ko.observable("");

    self.isPlaying = ko.observable(false);

    self.playerName = ko.observable("");
    self.teamName = ko.observable("");
    self.playerlist  = ko.observableArray([]);
    self.teamlist  = ko.observableArray([]);
    self.answerlist = ko.observableArray([]);

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

    // =========================================================================
    // Operations
    // =========================================================================

    self.joinGame = function() {

    }

    self.guessSong = function(answer) {

    }

    // =========================================================================
    // Helper functions
    // =========================================================================

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

    // "reveal song" is called to show what the last played song was
    self.socket.on('reveal song', function (song) {
        if (song.id === self.currentSong.id) return; // If we're already playing the song, just return
        self.currentSong(song);
    });

    // "start song" is called to begin a new song and provides a list of possible answers
    self.socket.on('start song', function (songlist) {
        self.answerlist(songlist);
        $("#answerlist").listview("refresh");
    });

    // "update song" is called to update the total song time and the time left
    self.socket.on('update song', function (song, isPlaying, songTime, timeRemaining) {
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
}

// Activates knockout.js
ko.applyBindings(new GameViewModel());
