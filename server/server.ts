/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';

import { BrowserSession } from './browser-management/BrowserSession';
import logger from './logger'
import {SocketConnection} from "./browser-management/SocketConnection";

const app = express();
app.use(cors());

const server = http.createServer(app);
const socket = new SocketConnection(server);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

const browserSession = new BrowserSession(socket);
(async () => {
    // sleep is needed to first connect to the socket.tsx io server
    await sleep(3000)
    function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    await browserSession.initialize({});
    await browserSession.subscribeToScreencast();
    await browserSession.openPage('https://cs.wikipedia.org/');
})();

if (socket.socket){
    socket.socket.on('interaction', (data) => {
        logger.log('debug', 'We are inside of interaction socket handler');
        (async () =>{
            await browserSession.clickOnCoordinates(data.coordinates.x, data.coordinates.y);
        })();
    })
}


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(8080, () => logger.log('info',`Listening on port 8080`));
