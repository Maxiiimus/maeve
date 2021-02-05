const rpio = require('rpio');
const isPi = require('detect-rpi');

// Set up Raspberry Pi
const OUTPUT_PIN = 36;   // Pin used to turn on the High Voltage relay switch

class VacuumController {
    constructor() {

        // Set class properties to use
        this.outputPin = OUTPUT_PIN;
        this.vacuumOn = false;

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
        this.vacuumOn = false;
        // Wait a bit, then turn off the pump (pin to LOW)
        // If a turn on call is made, then we won't turn it off
        // This keeps the pump from cycling on and off too much between tests or songs
        console.log("setting 2 second timeout to turn off pump")
        setTimeout(() => {
            if (!this.vacuumOn) {
                rpio.write(this.outputPin, rpio.LOW);
                console.log("Turned off Vacuum pump.")
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
