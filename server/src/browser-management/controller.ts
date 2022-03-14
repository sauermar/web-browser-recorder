import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection } from "../socket-connection/connection";
import { io, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";
import { RemoteBrowserOptions } from "../interfaces/Input";

export const createRemoteBrowser = (options: RemoteBrowserOptions): string => {
    const id = uuid();
    createSocketConnection(
        io.of(id),
        async (socket: Socket) => {
        const browserSession = new RemoteBrowser(socket);
        await browserSession.initialize(options);
        await browserSession.subscribeToScreencast();
        browserPool.addRemoteBrowser(id, browserSession);
    });
    return id;
};

export const destroyRemoteBrowser = async (id: string) : Promise<boolean> => {
    const browserSession = browserPool.getRemoteBrowser(id);
    if (browserSession) {
        await browserSession.switchOff();
    }
    return browserPool.deleteRemoteBrowser(id);
};
