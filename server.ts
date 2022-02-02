/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import cors from 'cors';

import {Server} from "socket.io";

const app = express();
app.use(cors());
// integrate socket.io for websocket communication
// necesary for socket.io
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

let interval: any;

io.on("connection", (socket : any) => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

const getApiAndEmit = (socket: any) => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(8080, () => console.log(`Listening on port 8080`));
