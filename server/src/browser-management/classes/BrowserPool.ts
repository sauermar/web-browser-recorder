import { RemoteBrowser } from "./RemoteBrowser";
import logger from "../../logger";

interface PoolDictionary {
    [key: string]: RemoteBrowser
}

export class BrowserPool {

    // holds all the running remote browser recording sessions
    private pool : PoolDictionary = {};

    /**
     * Adds a remote browser session to the pool.
     * @param id remote browser session's id
     * @param browser remote browser instance
     */
    public addRemoteBrowser = (id: string, browser: RemoteBrowser): void => {
        this.pool = {
            ...this.pool,
            [id]: browser,
        }
        logger.log('debug', `Remote browser with id: ${id} added to the pool`);
    };

    /**
     * Removes the remote browser session from the pool.
     * @param id remote browser session's id
     */
    public deleteRemoteBrowser = (id: string) : boolean => {
        if (!this.pool[id]) {
            logger.log('warn', `Remote browser with id: ${id} does not exist in the pool`);
            return false;
        }
        delete(this.pool[id]);
        logger.log('debug', `Remote browser with id: ${id} deleted from the pool`);
        return true;
    };

    /**
     * Returns remote browser instance from the pool.
     * @param id remote browser session's id
     */
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
