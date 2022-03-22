/**
 * Main class determining the flow of remote browser management.
 */
import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection } from "../socket-connection/connection";
import { server, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";
import { RemoteBrowserOptions } from "../interfaces/Input";

/**
 * Starts a remote browser recording session.
 * @param options remote browser options
 */
export const createRemoteBrowser = (options: RemoteBrowserOptions): string => {
    const id = uuid();
    createSocketConnection(
        server,
        async (socket: Socket) => {
        const browserSession = new RemoteBrowser(socket);
        await browserSession.initialize(options);
        await browserSession.subscribeToScreencast();
        browserPool.addRemoteBrowser(id, browserSession);
    });
    return id;
};

/**
 * Terminates a remote browser recording session.
 * @param id remote browser recording session's id
 */
export const destroyRemoteBrowser = async (id: string) : Promise<boolean> => {
    const browserSession = browserPool.getRemoteBrowser(id);
    if (browserSession) {
        await browserSession.switchOff();
    }
    return browserPool.deleteRemoteBrowser(id);
};
