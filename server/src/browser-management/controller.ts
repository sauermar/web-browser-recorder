/**
 * The main function group which determines the flow of remote browser management.
 * Holds the singleton instances of browser pool and socket.io server.
 */
import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

import { createSocketConnection, createSocketConnectionForRun } from "../socket-connection/connection";
import { io, browserPool } from "../server";
import { RemoteBrowser } from "./classes/RemoteBrowser";
import { RemoteBrowserOptions } from "../types";
import logger from "../logger";

/**
 * Starts and initializes a {@link RemoteBrowser} instance for recording.
 * Creates a new {@link Socket} connection over a dedicated namespace
 * and registers all interaction event handlers.
 * Returns the id of an active browser or the new remote browser's generated id.
 * @param options {@link RemoteBrowserOptions} to be used when launching the browser
 * @returns string
 */
export const initializeRemoteBrowserForRecording = (options: RemoteBrowserOptions): string => {
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
                await browserSession.registerEditorEvents();
                await browserSession.subscribeToScreencast();
                browserPool.addRemoteBrowser(id, browserSession, true);
            }
        });
    return id;
};

/**
 * Starts and initializes a {@link RemoteBrowser} instance for interpretation.
 * Creates a new {@link Socket} connection over a dedicated namespace.
 * Returns the new remote browser's generated id.
 * @param options {@link RemoteBrowserOptions} to be used when launching the browser
 * @returns string
 */
export const createRemoteBrowserForRun = (options: RemoteBrowserOptions): string => {
    const id = uuid();
    createSocketConnectionForRun(
      io.of(id),
    async (socket: Socket) => {
          const browserSession = new RemoteBrowser(socket);
          await browserSession.initialize(options);
          browserPool.addRemoteBrowser(id, browserSession, true);
          socket.emit('ready-for-run');
      });
    return id;
};

/**
 * Terminates a remote browser recording session
 * and removes the browser from the browser pool.
 * @param id instance id of the remote browser to be terminated
 * @returns {Promise<boolean>}
 */
export const destroyRemoteBrowser = async (id: string) : Promise<boolean> => {
    const browserSession = browserPool.getRemoteBrowser(id);
    if (browserSession) {
        logger.log('debug', `Switching off the browser with id: ${id}`);
        await browserSession.stopCurrentInterpretation();
        await browserSession.switchOff();
    }
    return browserPool.deleteRemoteBrowser(id);
};

/**
 * Returns the id of an active browser or null.
 * Wrapper around {@link browserPool.getActiveBrowserId()} function.
 * @returns {string | null}
 */
export const getActiveBrowserId = (): string | null=> {
    return browserPool.getActiveBrowserId();
};

/**
 * Returns the url string from a remote browser if exists in the browser pool.
 * @param id instance id of the remote browser
 * @returns {string | undefined}
 */
export const getRemoteBrowserCurrentUrl = (id: string): string | undefined => {
    return browserPool.getRemoteBrowser(id)?.getCurrentPage()?.url();
};

/**
 * Returns the array of tab strings from a remote browser if exists in the browser pool.
 * @param id instance id of the remote browser
 * @return {string[] | undefined}
 */
export const getRemoteBrowserCurrentTabs = (id: string): string[] | undefined => {
    return browserPool.getRemoteBrowser(id)?.getCurrentPage()?.context().pages()
      .map((page) => {
          const parsedUrl = new URL(page.url());
          const host =  parsedUrl.hostname.match(/\b(?!www\.)[a-zA-Z0-9]+/g)?.join('.');
          if (host) {
            return host;
          }
          return 'new tab';
      });
};

/**
 * Interprets the currently generated workflow in the active browser instance.
 * If there is no active browser, the function logs an error.
 * @returns {Promise<void>}
 */
export const interpretWholeWorkflow = async() => {
    const id = getActiveBrowserId();
    if (id) {
    const browser = browserPool.getRemoteBrowser(id);
    await browser?.interpretCurrentRecording();
    } else {
      logger.log('error', 'Cannot interpret the workflow: No active browser.');
    }
};

/**
 * Stops the interpretation of the current workflow in the active browser instance.
 * If there is no active browser, the function logs an error.
 * @returns {Promise<void>}
 */
export const stopRunningInterpretation = async() => {
    const id = getActiveBrowserId();
    if (id) {
      const browser = browserPool.getRemoteBrowser(id);
      await browser?.stopCurrentInterpretation();
    } else {
      logger.log('error', 'Cannot stop interpretation: No active browser or generator.');
    }
};
