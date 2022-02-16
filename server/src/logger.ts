import { createLogger, format, transports } from 'winston';

const { combine, colorize, timestamp, printf } = format;


const logger = createLogger({
    format: combine(
        colorize(),
        timestamp(),
        printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.Console({level: 'debug'}),
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `debug` or less to `combined.log`
        //
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log', level: 'debug' }),
    ],
});

export default logger;
