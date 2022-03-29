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

const app = express();
// enabling cors for communication with client on a different port/domain
app.use(cors());

export const server = http.createServer(app);
export const browserPool = new BrowserPool();

// subscription for api routes
app.use('/record', recordRoutes);

app.get('/', function (req, res) {
    return res.send('Welcome to the BR recorder server :-)');
});

server.listen(SERVER_PORT, () => logger.log('info',`Server listening on port ${SERVER_PORT}`));
