import log from 'loglevel';
// @ts-ignore
import remote from 'loglevel-plugin-remote';

const customJSON = (log: any) => ({
    msg: log.message,
    level: log.level.label,
    stacktrace: log.stacktrace
});

//remote.apply(log, { format: customJSON, url: 'http://localhost:8080/log', method: 'POST' });

log.enableAll();

//TODO: level is set to development for now - need to be silenced for production and 'error' level should be used instead
log.setLevel('debug')

export default log;
