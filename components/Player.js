/*
    The Key Class has two primary functions:
        1)  A key struck in quick succession. In this case, we will keep track of the "decay" after a key
            goes "off" before we allow it to go back on. This gives some time for the piano action return.
        2)  A key struck while it's already being played. In this case, we need to insert a "delay" to allow
            the piano action to return far enough for the key to actually strike again.
 */

// NOTE_DELAY is how long to delay in milliseconds
const NOTE_DELAY = 100;

class Player {
    constructor(name) {
        // Set class properties to use
        this.score = 0;
        this.name = name;
    }

    // Get the player's score
    getScore() {
        return this.score;
    }

    // Add points to the player's score
    addPoints(points) {
        this.score += points;
    }

    // Reset the player's score
    resetScore() {
        this.score = 0;
    }

    // Get player's name
    getName() {
        return this.name;
    }

    // This is called when a note is set to "Off" in the midi file
    // When a note is set to "Off" we want to wait a bit before it can be struck again to allow the
    // piano action to fall back.
    noteOff(millis) {
        this.isNoteOn = false;
        this.delay = millis + NOTE_DELAY;
    }

    isOn(millis) {
        //if (millis < this.delay) {
        //    console.log("Delaying: " + millis + " < " + this.delay);
        //}
        return (this.isNoteOn && millis >= this.delay);
    }
}

module.exports = Player;
