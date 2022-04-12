import {
    Page,
    Browser,
    CDPSession,
} from 'playwright';
import { Socket } from "socket.io";

import logger from '../../logger';
import { RemoteBrowserOptions } from "../../interfaces/Input";
import { WorkflowGenerator } from "../../workflow-management/generator";
import { WorkflowFile } from "@wbr-project/wbr-interpret";

export class RemoteBrowser {

    private browser: Browser | null = null;

    private pages : Page[] = [];

    private client : CDPSession | null = null;

    private readonly socket : Socket;

    public currentPage : Page | null = null;

    public generator: WorkflowGenerator | null = null;

    public constructor(socket: Socket){
        this.socket = socket;
    }

    /**
     * Constructor for asynchronous properties.
     * Must be called right after creating an instance of RemoteBrowser class.
     * @param options remote browser options
     */
    public initialize = async(options: RemoteBrowserOptions) : Promise<void> => {
        // initialize the browser instance
        this.browser = <Browser>(await options.browser.launch(options.launchOptions));
        //initialize page context
        const context = await this.browser.newContext();
        this.currentPage = await context.newPage();
        this.pages = this.pages.concat([this.currentPage]);
        //initialize CDP session
        this.client = await this.currentPage.context().newCDPSession(this.currentPage);
        this.generator = new WorkflowGenerator(this.currentPage, this.socket);
    };

    /**
     * Initiates screencast of the remote browser.
     */
    private startScreencast = async() : Promise<void> => {
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        await this.client.send('Page.startScreencast', { format: 'jpeg', quality: 75 });
        logger.log('info',`Browser started with screencasting.`);
    };

    /**
     * Sends a screenshot every time the browser active page updates.
     */
    public subscribeToScreencast = async() : Promise<void> => {
        await this.startScreencast();
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        this.client.on('Page.screencastFrame', ({ data: base64, sessionId }) => {
            this.emitScreenshot(base64);
            setTimeout(async () => {
                try {
                    if (!this.client) {
                        logger.log('warn','client is not initialized');
                        return;
                    }
                    await this.client.send('Page.screencastFrameAck', { sessionId: sessionId });
                } catch (e) {
                    logger.log('error', e);
                }
            }, 100);
        });
    };

    /**
     * Terminates the remote browser.
     */
    public switchOff = async() : Promise<void> => {
        if (this.browser) {
            await this.stopScreencast();
            await this.browser.close();
        } else {
            logger.log('error', 'Browser wasn\'t initialized');
            throw new Error('Switching off the browser failed');
        }
    };

    /**
     * Unsubscribes the browser from screencast.
     */
    private stopScreencast = async() : Promise<void> => {
        if (!this.client) {
            logger.log('error','client is not initialized');
            throw new Error('Screencast stop failed');
        }
        await this.client.send('Page.stopScreencast');
        logger.log('info',`Browser stopped with screencasting.`);
    };

    /**
     * Helper for emitting the screenshot of browser's active page through websocket.
     * @param payload the screenshot binary data
     */
    private emitScreenshot = (payload: any) : void => {
        const dataWithMimeType = ('data:image/jpeg;base64,').concat(payload);
        this.socket.emit('screencast', dataWithMimeType);
        logger.log('debug',`Screenshot emitted`);
    };
};
