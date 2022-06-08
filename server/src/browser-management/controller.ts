/**
 * Main class determining the flow of remote browser management.
 */
import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection, createSocketConnectionForRun } from "../socket-connection/connection";
import { io, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";
import { RemoteBrowserOptions } from "../types";
import logger from "../logger";

/**
 * Starts a remote browser recording session.
 * @param options remote browser options
 */
export const createRemoteBrowser = (options: RemoteBrowserOptions): string => {
    const id = getActiveBrowserId() || uuid();
    createSocketConnection(
        io.of(id),
        async (socket: Socket) => {
            // browser is already active
            const activeId = getActiveBrowserId();
            if (activeId) {
                const remoteBrowser = browserPool.getRemoteBrowser(activeId);
                remoteBrowser?.updateSocket(socket);
                await remoteBrowser?.makeAndEmitScreenshot();
            } else {
                const browserSession = new RemoteBrowser(socket);
                browserSession.interpreter.subscribeToPausing();
                await browserSession.initialize(options);
                await browserSession.subscribeToScreencast();
                browserPool.addRemoteBrowser(id, browserSession);
            }
        });
    return id;
};


export const createRemoteBrowserForRun = async(options: RemoteBrowserOptions): Promise<string> => {
    const id = uuid();
    createSocketConnectionForRun(
      io.of(id),
    async (socket: Socket) => {
          const browserSession = new RemoteBrowser(socket);
          await browserSession.initialize(options);
          browserPool.addRemoteBrowser(id, browserSession);
          socket.emit('ready-for-run');
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
        logger.log('debug', `Switching off the browser with id: ${id}`);
        await browserSession.switchOff();
    }
    return browserPool.deleteRemoteBrowser(id);
};

//TODO reprogram this
// just for development
export const getActiveBrowserId = () => {
    return browserPool.getActiveBrowserId();
};

export const getActiveBrowserCurrentUrl = (id: string) => {
    return browserPool.getRemoteBrowser(id)?.getCurrentPage()?.url();
};

export const interpretWholeWorkflow = async() => {
    const id = getActiveBrowserId();
    const browser = browserPool.getRemoteBrowser(id);
    if (browser) {
        await browser.interpretCurrentRecording();
    } else {
        logger.log('error', 'Cannot interpret the workflow: No active browser.');
        throw new Error('No active browser');
    }

};

export const stopRunningInterpretation = async() => {
    const id = getActiveBrowserId();
    const browser = browserPool.getRemoteBrowser(id);
    if (browser) {
        await browser.stopCurrentInterpretation();
    } else {
        logger.log('error', 'Cannot stop interpretation: No active browser or generator.');
    }
};
