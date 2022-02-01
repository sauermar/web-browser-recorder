/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';

import { Server } from "socket.io";

const app = express();
// integrate socket.io for websocket communication
// necesary for socket.io
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
