const rpio = require('rpio');
const isPi = require('detect-rpi');

// Set up Raspberry Pi
const OUTPUT_PIN = 35;   // Pin used to open the sustaining pedal valve

class SustainController {
    constructor() {

        // Set class properties to use
        this.outputPin = OUTPUT_PIN;
        this.sustainOn = false;

        // If running on another OS, then just mock the RaspberryPi
        if (!isPi()) {
            console.log("Not on Pi. Mocking the SustainController.");
            rpio.init({mock: 'raspi-3'});
            /* Override default warn handler to avoid mock warnings */
            rpio.on('warn', function() {});
        } else {
            console.log("SustainController RPIO Enabled. OUTPUT PIN: " + this.outputPin);
        }

        // Open the output pin for writing
        rpio.open(this.outputPin, rpio.OUTPUT, rpio.LOW);
    }

    /*
        Open the sustain valve
     */
    pedalOn() {
        if (this.sustainOn) {
            console.log("Sustain pedal is already on. Returning.")
            return;
        }
        // Set pin to HIGH
        rpio.write(this.outputPin, rpio.HIGH);
        this.sustainOn = true;
        console.log("Sustain pedal on.")
    }

    /*
        Close the sustain valve
    */
    pedalOff() {
        if (!this.sustainOn) {
            console.log("Sustain pedal is already off. Returning.")
            return;
        }
        // Set pin to LOW
        rpio.write(this.outputPin, rpio.LOW);
        this.sustainOn = false;
        console.log("Sustain pedal off.")
    }
}

module.exports = SustainController;
