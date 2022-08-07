/**
 * HTTP express server for the browser recorder client application.
 */
import express from 'express';
import http from 'http';
import cors from 'cors';
/**
 * loads .env config to the process - allows a custom configuration for the server
 */
import 'dotenv/config';

import { record, workflow, storage } from './routes';
import { BrowserPool } from "./browser-management/classes/BrowserPool";
import logger from './logger'
import { SERVER_PORT } from "./constants/config";
import {Server} from "socket.io";

/**
 * Creates a new express server instance.
 * @type {express.Express}
 */
const app = express();
/**
 * Enabling cors for communication with client on a different port/domain.
 */
app.use(cors());
/**
 * Automatic parsing of incoming JSON data.
 */
app.use(express.json())

/**
 * Initialize the server.
 * @type {http.Server}
 */
const server = http.createServer(app);

/**
 * Globally exported singleton instance of socket.io for socket communication with the client.
 * @type {Server}
 */
export const io = new Server(server);
/**
 * {@link BrowserPool} globally exported singleton instance for managing browsers.
 */
export const browserPool = new BrowserPool();

/**
 * API routes for the server.
 */
app.use('/record', record);
app.use('/workflow', workflow);
app.use('/storage', storage);

app.get('/', function (req, res) {
    return res.send('Welcome to the BR recorder server :-)');
});

server.listen(SERVER_PORT, () => logger.log('info',`Server listening on port ${SERVER_PORT}`));
