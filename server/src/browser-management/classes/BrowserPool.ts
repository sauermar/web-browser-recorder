import { RemoteBrowser } from "./RemoteBrowser";
import logger from "../../logger";

interface PoolDictionary {
    [key: string]: RemoteBrowser
}

export class BrowserPool {

    private pool : PoolDictionary = {};

    public addRemoteBrowser = (id: string, browser: RemoteBrowser) => {
        this.pool = {
            ...this.pool,
            [id]: browser,
        }
        logger.log('debug', `Remote browser with id: ${id} added to the pool`);
    };

    public deleteRemoteBrowser = (id: string) => {
        if (!this.pool[id]) {
            logger.log('warn', `Remote browser with id: ${id} does not exist in the pool`);
            return;
        }
        delete(this.pool[id]);
        logger.log('debug', `Remote browser with id: ${id} deleted from the pool`);
    };

    public getRemoteBrowser = (id: string) : RemoteBrowser | undefined => {
        logger.log('debug', `Remote browser with id: ${id} retrieved from the pool`);
        return this.pool[id];
    };

    //TODO: move the logic where it makes more sense
    public getActiveBrowserId = () => {
        if (!Object.keys(this.pool)[0]) {
            logger.log('warn', `No active browser in the pool`);
        }
        return Object.keys(this.pool)[0];
    };
}
