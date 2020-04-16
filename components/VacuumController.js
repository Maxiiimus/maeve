const rpio = require('rpio');
const isPi = require('detect-rpi');

// Set up Raspberry Pi
const OUTPUT_PIN = 12;   // Pin used to turn on the High Voltage relay switch

class VacuumController {
    constructor(registerSize, moduleCount) {

        // If running on another OS, then just mock the RaspberryPi
        if (!isPi()) {
            console.log("Not running on Raspberry Pi - Mocking");
            rpio.init({mock: 'raspi-3'});
            /* Override default warn handler to avoid mock warnings */
            rpio.on('warn', function() {});
        } else {
            console.log("Running on Raspberry Pi - RPIO Enabled");
        }

        // Set class properties to use
        this.outputPin = OUTPUT_PIN;
        this.vacuumOn = false;

        console.log("Vacuum Controller Output pin: "+ this.outputPin);

        // Open the output pin for writing
        rpio.open(this.outputPin, rpio.OUTPUT, rpio.LOW);
    }

    /*
        Turn on the vacuum pump.
     */
    turnOn() {
        // Set pin to HIGH
        rpio.write(this.outputPin, rpio.HIGH);
        this.vacuumOn = true;
        console.log("Turned on Vacuum pump.")
    }

    /*
        Turn off the vacuum pump.
    */
    turnOff() {
        // Set pin to HIGH
        rpio.write(this.outputPin, rpio.LOW);
        this.vacuumOn = false;
        console.log("Turned off Vacuum pump.")
    }

    /*
        Check if the vacuum is on or off
    */
    isOn() {
        return this.vacuumOn;
    }
}

module.exports = VacuumController;
