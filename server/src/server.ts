/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import { Socket } from 'socket.io';
 // load .env config to the process
import 'dotenv/config';

import { BrowserSession } from './browser-management/BrowserSession';
import logger from './logger'
import { createSocketConnection } from "./socket-connection/connection";
import { SERVER_PORT } from "./constants/config";

const app = express();
app.use(cors());

const server = http.createServer(app);
createSocketConnection(server, async (socket: Socket) => {
    const browserSession = new BrowserSession(socket);
    await browserSession.initialize({});
    await browserSession.subscribeToScreencast();
    await browserSession.openPage('https://cs.wikipedia.org/');
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(SERVER_PORT, () => logger.log('info',`Server listening on port ${SERVER_PORT}`));
