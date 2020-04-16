const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const keyRegister = require('./components/KeyRegister');
const PianoServer = require('./components/PianoServer');
const VacuumController = require('./components/VacuumController');

// Set up client browser
const port = process.env.PORT || "80";
app.use(express.static(path.join(__dirname, 'public')));

// Set up Raspberry Pi
const MODULE_COUNT = 11;
const REGISTER_SIZE = 8;

// The register is all of the shift registers representing the keys
let register = new keyRegister(REGISTER_SIZE, MODULE_COUNT);
let vacuumController = new VacuumController(REGISTER_SIZE, MODULE_COUNT);
let pianoServer = new PianoServer();

pianoServer.start(http, io, port, register, vacuumController);
