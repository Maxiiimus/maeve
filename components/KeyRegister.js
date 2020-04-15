//import rpio from 'rpio';
//import isPi from 'detect-rpi';
const rpio = require('rpio');
const isPi = require('detect-rpi');

// Set up Raspberry Pi
//const numModules = 11;
//const registerSize = 8;
const SER_PIN = 11;   // Serial Input SER (18 on chip)
const RCK_PIN = 13;   // Register Clock (RCLK, 7 on chip) - Latch pin
const SRCK_PIN = 15;   // Shift-Register Clock (SRCLK, 8 on chip) - Clock pin
const SRCLR_PIN = 16; // Shift_Register clear (SRCLR - 3 on chip) - Set to high to enable storage transfer

class KeyRegister {
    //constructor(data, clock, latch, clear) {
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
        this.dataPin = SER_PIN; //data;
        this.clockPin = SRCK_PIN// clock;
        this.latchPin = RCK_PIN; // latch;
        this.clearPin = SRCLR_PIN; // clear;
        this.registerSize = registerSize;
        this.moduleCount = moduleCount;

        console.log("data: "+ this.dataPin);
        console.log("clock: "+ this.clockPin);
        console.log("latch: "+ this.latchPin);
        console.log("clear: "+ this.clearPin);

        // Open the data, clock, and latch pins for writing
        rpio.open(this.dataPin, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.clockPin, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.latchPin, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.clearPin, rpio.OUTPUT, rpio.HIGH);
    }

    /*
        Send an array of bits to the shift registers
        Will send all values of the Buffer, regardless of the number of registers
     */
    send(original_data) {
        //console.log("Incoming  Data: " + JSON.stringify(original_data));
        let data = this.reorderKeyData(original_data);
        //console.log("Reordered Data: " + JSON.stringify(data));

        // Set data and clock pins to low to start
        rpio.write(this.dataPin, rpio.LOW);
        rpio.write(this.clockPin, rpio.LOW);

        // Serial in of all the data to shift register(s) memory
        for (let i = 0; i < data.length; i++) {
            // Set the data pin to the 1 or 0 bit value
            rpio.write(this.dataPin, data[i] ? rpio.HIGH : rpio.LOW)

            // Cycle the clock pin to write to the shift register memory
            rpio.write(this.clockPin, rpio.HIGH);
            rpio.write(this.clockPin, rpio.LOW);
        }

        // All bits are in shift register memory, now cycle the latch pin to push to outputs
        rpio.write(this.latchPin, rpio.HIGH);
        rpio.write(this.latchPin, rpio.LOW);
    }

    // Unfortunately, the hardware input and output ports on the key controller modules are backward.
    // Therefore, the valves are in reverse order for each module of 8 valves and keys.
    // Instead of having all of the wires or tubes mixed around, this function reorders the buffer array
    // to load bits in the mapping to the keys on the piano.
    // If this has a measurable impact on performance, then will address in hardware.
    reorderKeyData(original_data) {
        let data = Buffer.from(original_data);
        //let numModules = data.length / 8; // Get the number of modules. Each module has 8 keys
        //console.log("NumModules: " + numModules);
        let i, j, offset, temp;

        // Loop through each module and swap the order
        for (i = 0; i < this.moduleCount; i++) {
            offset = i * this.registerSize;
            for (j = 0; j < 4; j++) {
                temp = data[offset+j];
                data[offset+j] = data[offset + this.registerSize - 1 - j];
                data[offset + this.registerSize - 1 - j] = temp;
            }
        }
        return data;
    }

    /*
        Clear the register by toggling the clear bit
     */
    clear() {
        rpio.open(this.clearPin, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.clearPin, rpio.OUTPUT, rpio.HIGH);
    }
}

module.exports = KeyRegister;
