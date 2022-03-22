/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import http from 'http';
import cors from 'cors';
 // load .env config to the process
import 'dotenv/config';

import routes from './routes';
import { BrowserPool } from "./browser-management/classes/BrowserPool";
import logger from './logger'
import { SERVER_PORT } from "./constants/config";
import {Server} from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);

export const io = new Server(server);
export const browserPool = new BrowserPool();

app.use('/record', routes.record);
app.use('/log', routes.log);

app.get('/', function (req, res) {
    return res.send('Welcome to the BR recorder server :-)');
});

server.listen(SERVER_PORT, () => logger.log('info',`Server listening on port ${SERVER_PORT}`));
