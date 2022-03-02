import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection } from "../socket-connection/connection";
import { server, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";

export const createRemoteBrowser = (): string => {
    const id = uuid();
    createSocketConnection(
        server,
        async (socket: Socket, id: string) => {
        const browserSession = new RemoteBrowser(socket);
        await browserSession.initialize({});
        await browserSession.subscribeToScreencast();
        browserPool.addRemoteBrowser(id, browserSession);
    }, id);
    return id;
};

export const destroyRemoteBrowser = async (id: string) : Promise<boolean> => {
    const browserSession = browserPool.getRemoteBrowser(id);
    if (browserSession) {
        await browserSession.switchOff();
    }
    return browserPool.deleteRemoteBrowser(id);
};
