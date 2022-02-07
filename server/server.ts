/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import cors from 'cors';

import { Server } from "socket.io";
import {BrowserSession} from "./browser-management/BrowserSession";

const app = express();
app.use(cors());
// integrate socket.io for websocket communication
// necesary for socket.io
const server = http.createServer(app);
export const io = new Server(server);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/ping', function (req, res) {
    return res.send('pong');
});

const browserSession = new BrowserSession();
(async () => {
    await sleep(3000)
    function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    await browserSession.initialize({});
    await browserSession.openPage('https://cs.wikipedia.org/');
})();

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(8080, () => console.log(`Listening on port 8080`));
