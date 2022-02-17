import { Socket } from "socket.io";

import { createSocketConnection } from "../socket-connection/connection";
import { server } from "../server";
import { RemoteBrowser } from "./RemoteBrowser";

export const createRemoteBrowser = () => {
    createSocketConnection(server, async (socket: Socket) => {
        const browserSession = new RemoteBrowser(socket);
        await browserSession.initialize({});
        await browserSession.subscribeToScreencast();
        await browserSession.openPage('https://cs.wikipedia.org/');
    });
};
