/**
 * Server side logger set up. Uses winston library with customized log format
 * and multiple logging outputs.
 */
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf } = format;

import { DEBUG, LOGS_PATH } from "./constants/config";


const logger = createLogger({
    format: combine(
        timestamp(),
        printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.Console({ level: DEBUG ? 'debug' : 'info' }),
        new transports.File({ filename: `${LOGS_PATH}/error.log`, level: 'error' }),
        new transports.File({ filename: `${LOGS_PATH}/combined.log`, level: DEBUG ? 'debug' : 'info' }),
    ],
});

export default logger;
