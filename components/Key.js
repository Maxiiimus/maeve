/*
    The Key Class has two primary functions:
        1)  A key struck in quick succession. In this case, we will keep track of the "decay" after a key
            goes "off" before we allow it to go back on. This gives some time for the piano action return.
        2)  A key struck while it's already being played. In this case, we need to insert a "delay" to allow
            the piano action to return far enough for the key to actually strike again.
 */

// NOTE_DELAY is how long to delay in milliseconds
const NOTE_DELAY = 100;

class Key {
  constructor() {
    // Set class properties to use
    this.delay = 0;
    this.isNoteOn = false;
  }

  // This function is called when a note is set to "On" in the midi file
  noteOn(millis) {
    // First, check if the key is already on.
    // This can happen if there are multiple tracks playing the same notes.
    // Start a delay to let the piano action fall.
    this.delay = this.isNoteOn ? millis + NOTE_DELAY : millis;
    // console.log("Key.noteOn() delay = " + this.delay);

    this.isNoteOn = true;
  }

  // This is called when a note is set to "Off" in the midi file
  // When a note is set to "Off" we want to wait a bit before it can be struck again to allow the
  // piano action to fall back.
  noteOff(millis) {
    this.isNoteOn = false;
    this.delay = millis + NOTE_DELAY;
  }

  isOn(millis) {
    // if (millis < this.delay) {
    //    console.log("Delaying: " + millis + " < " + this.delay);
    // }
    return (this.isNoteOn && millis >= this.delay);
  }
}

module.exports = Key;
