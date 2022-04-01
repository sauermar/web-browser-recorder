/**
 * HTTP express server for the browser recorder client application.
 * This server is an independent project running on a different port,
 * with own package.json for better maintenance and logic division.
 */
import express from 'express';
import http from 'http';
import cors from 'cors';
 // load .env config to the process - allows a custom configuration for server
import 'dotenv/config';

import { recordRoutes } from './routes';
import { BrowserPool } from "./browser-management/classes/BrowserPool";
import logger from './logger'
import { SERVER_PORT } from "./constants/config";
import {Server} from "socket.io";

const app = express();
// enabling cors for communication with client on a different port/domain
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
