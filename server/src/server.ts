/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import { Socket } from 'socket.io';

import { BrowserSession } from './browser-management/BrowserSession';
import logger from './logger'
import { createSocketConnection } from "./socket-connection/connection";

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

server.listen(8080, () => logger.log('info',`Listening on port 8080`));
