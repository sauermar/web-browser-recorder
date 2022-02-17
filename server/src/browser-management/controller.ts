import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection } from "../socket-connection/connection";
import { server, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";

export const createRemoteBrowser = () => {
    createSocketConnection(server, async (socket: Socket) => {
        const browserSession = new RemoteBrowser(socket);
        await browserSession.initialize({});
        await browserSession.subscribeToScreencast();
        browserPool.addRemoteBrowser(uuid(), browserSession);

        await browserSession.openPage('https://cs.wikipedia.org/');
    });
};
