/**
 * HTTP server for the cloud browser recorder application.
 */
import express from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
 // load .env config to the process
import 'dotenv/config';

import routes from './routes';
import logger from './logger'
import { SERVER_PORT } from "./constants/config";

const app = express();
app.use(cors());

export const server = http.createServer(app);

app.use('/record', routes.record);

app.get('/', function (req, res) {
    return res.send('Welcome to the BR recorder server :-)');
});

server.listen(SERVER_PORT, () => logger.log('info',`Server listening on port ${SERVER_PORT}`));
