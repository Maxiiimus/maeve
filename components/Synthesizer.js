const Fluid = require('fluid4node');
const isPi = require('detect-rpi');

const NUM_CHANNELS = 16;
const NUM_NOTES = 128;

class Synthesizer {
    constructor() {
        if (isPi()) { // On Raspberry Pi
            this.fluid = new Fluid({
                libs: ['/usr/lib/arm-linux-gnueabihf/libfluidsynth.so.1'],
                drivers: ['alsa'],
                soundFonts: ['soundfonts/MuseScore_General.sf3']
            });
        } else { // MacOS
            this.fluid = new Fluid({
                libs: ['/usr/local/Cellar/fluid-synth/2.1.1/lib/libfluidsynth.2.3.1.dylib'],
                drivers: ['coreaudio'],
                soundFonts: ['soundfonts/MuseScore_General.sf3']
            });
        }
        this.fluid.setGain(1.0);
    }

    playMidiEvent(event) {
        if (event.name && event.name.toLowerCase() === "note on" && event.velocity !== 0) {
            this.fluid.noteOn(event.channel-1, event.noteNumber, event.velocity);
        } else if (event.name && event.name.toLowerCase() === "note off" || event.velocity === 0) {
            this.fluid.noteOff(event.channel-1, event.noteNumber);
        } else if (event.name && event.name.toLowerCase() === "program change") {
            this.fluid.programChange(event.channel-1, event.value);
            console.log("Synthesizer loading channel [" + event.channel +"] with instrument " + event.value);
        }
    }

    stop() {
        // Call noteOff for all possible notes
        // Seems there should be a more efficient way...
        for (let i = 0; i < NUM_CHANNELS; i++) {
            for (let j = 0; j < NUM_NOTES; j++) {
                this.fluid.noteOff(i, j);
            }
        }
    }

    setVolume(volume) {
        this.fluid.setGain(volume);
    }
}

module.exports = Synthesizer;
