const rpio = require('rpio');
const isPi = require('detect-rpi');

// Set up Raspberry Pi
const OUTPUT_PIN = 36;   // Pin used to turn on the High Voltage relay switch

class VacuumController {
    constructor() {

        // Set class properties to use
        this.outputPin = OUTPUT_PIN;
        this.vacuumOn = false;
        this.enabled = true; // Override to not actually turn on/off the vacuum. This is for when the piano is off
                             // and the synth piano is being used instead.

        // If running on another OS, then just mock the RaspberryPi
        if (!isPi()) {
            console.log("Not on Pi. Mocking the VacuumController.");
            rpio.init({mock: 'raspi-3'});
            /* Override default warn handler to avoid mock warnings */
            rpio.on('warn', function() {});
        } else {
            console.log("VacuumController RPIO Enabled. OUTPUT PIN: " + this.outputPin);
        }

        // Open the output pin for writing
        rpio.open(this.outputPin, rpio.OUTPUT, rpio.LOW);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.vacuumOn = false;
            rpio.write(this.outputPin, rpio.LOW);
        }
    }

    /*
        Turn on the vacuum pump.
     */
    turnOn() {
        if (!this.enabled) return; // override if the vaccum isn't enabled
        // Set pin to HIGH
        rpio.write(this.outputPin, rpio.HIGH);
        this.vacuumOn = true;

        //console.log("Turned on Vacuum pump.")
    }

    /*
        Turn off the vacuum pump.
    */
    turnOff() {
        this.vacuumOn = false;
        // Wait a bit, then turn off the pump (pin to LOW)
        // If a turn on call is made, then we won't turn it off
        // This keeps the pump from cycling on and off too much between tests or songs
        //console.log("setting 2 second timeout to turn off pump")
        setTimeout(() => {
            if (!this.vacuumOn) {
                rpio.write(this.outputPin, rpio.LOW);
                //console.log("Turned off Vacuum pump.")
            }
        }, 2000); // Wait 2 seconds, then turn off
    }

    /*
        Check if the vacuum is on or off
    */
    isOn() {
        return this.vacuumOn;
    }
}

module.exports = VacuumController;
