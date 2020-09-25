const MidiPlayer = require('midi-player-js');

class MidiAnalyzer {
    constructor(player) {
        this.player = player;
    }

    analyze() {
        this.player.tracks.forEach(function(track){
            track.events.forEach(function(event){
                if(event.name && (event.name.toLowerCase() === "note on" || event.name.toLowerCase() === "note off")) {
                    if (event.tick > lastTick) {
                        //lastTick = event.tick;
                    }
                }
            });
        });
    }
}

module.exports = MidiAnalyzer;
