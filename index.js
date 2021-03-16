const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const PianoServer = require('./components/PianoServer');

// Set up client browser
const port = process.env.PORT || "80";
app.use(express.static(path.join(__dirname, 'public')));

// This is the main component for controlling the piano
let pianoServer = new PianoServer();
pianoServer.start(http, io, port);
