import {
    Page,
    Browser,
    CDPSession,
} from 'playwright';
import { Socket } from "socket.io";

import logger from '../../logger';
import { RemoteBrowserOptions } from "../../types";
import { WorkflowGenerator } from "../../workflow-management/classes/Generator";
import { WorkflowInterpreter } from "../../workflow-management/classes/Interpreter";

export class RemoteBrowser {

    private browser: Browser | null = null;

    private client : CDPSession | null | undefined = null;

    private socket : Socket;

    private currentPage : Page | null | undefined = null;

    public generator: WorkflowGenerator;

    public interpreter: WorkflowInterpreter;

    public constructor(socket: Socket) {
        this.socket = socket;
        this.interpreter = new WorkflowInterpreter(socket);
        this.generator = new WorkflowGenerator(socket);
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
        //initialize CDP session of the active page
        this.client = await this.currentPage.context().newCDPSession(this.currentPage);


        this.socket.on('rerender', async() => await this.makeAndEmitScreenshot());
        this.socket.on('changeTab', async(tabIndex) => await this.changeTab(tabIndex));
        this.socket.on('addTab', async () => {
            await this.currentPage?.context().newPage();
            const lastTabIndex = this.currentPage ? this.currentPage.context().pages().length - 1 : 0;
            await this.changeTab(lastTabIndex);
        });
        this.socket.on('closeTab', async (tabInfo) => {
            const page = this.currentPage?.context().pages()[tabInfo.index];
            if (page) {
                console.log(tabInfo.isCurrent);
                if (tabInfo.isCurrent){
                    if (this.currentPage?.context().pages()[tabInfo.index + 1]) {
                        // next tab
                        console.log('changing to next tab')
                        await this.changeTab(tabInfo.index + 1);
                    } else {
                        //previous tab
                        await this.changeTab(tabInfo.index - 1);
                    }
                }
                // close the page and log it
                await page.close();
                logger.log(
                  'debug',
                  `${tabInfo.index} page was closed, new length of pages: ${this.currentPage?.context().pages().length}`
                )
            } else {
                logger.log('error', `${tabInfo.index} index out of range of pages`)
            }
        });

        this.socket.emit('loaded');

        // TODO: remove next two lines are just for debugging
        const log = (msg: string) => console.log(msg);
        await this.currentPage.exposeFunction("log", log);
    };

    /**
     * Initiates screencast of the remote browser's page.
     */
    private startScreencast = async() : Promise<void> => {
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        await this.client.send('Page.startScreencast', { format: 'jpeg', quality: 75 });
        logger.log('info',`Browser started with screencasting a page.`);
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

    public updateSocket = (socket: Socket) : void => {
        this.socket = socket;
        this.generator?.updateSocket(socket);
        this.interpreter?.updateSocket(socket);
    };

    public makeAndEmitScreenshot = async() : Promise<void> => {
        try {
            const screenshot = await this.currentPage?.screenshot();
            if (screenshot) {
                this.emitScreenshot(screenshot.toString('base64'));
            }
        } catch (e) {
            const { message } = e as Error;
            logger.log('error', message);
        }
    };

    private initializeNewPage = async (options?: Object) : Promise<void> => {
        const newPage = options ? await this.browser?.newPage(options)
          : await this.browser?.newPage();

        await this.currentPage?.close();
        this.currentPage = newPage;
        this.client = await this.currentPage?.context().newCDPSession(this.currentPage);
        await this.subscribeToScreencast();
    };

    public interpretCurrentRecording = async () : Promise<void> => {
        if (this.generator) {
            const workflow = this.generator.getWorkflowFile();
            await this.initializeNewPage();
            if (this.currentPage) {
                await this.interpreter.interpretRecordingInEditor(
                  workflow, this.currentPage,
                  (newPage: Page) => this.currentPage = newPage,
                );
            } else {
                logger.log('error', 'Could not get a new page, returned undefined');
            }
        } else {
            logger.log('error', 'Generator is not initialized');
        }
    };

    public stopCurrentInterpretation = async () : Promise<void> => {
        await this.interpreter.stopInterpretation();
        await this.initializeNewPage();
    };

    public getCurrentPage = () : Page | null | undefined => {
        return this.currentPage;
    };

    private changeTab = async (tabIndex: number) => {
        const page = this.currentPage?.context().pages()[tabIndex];
        if (page) {
            await this.stopScreencast();
            this.currentPage = page;
            await this.currentPage.setViewportSize({height: 720, width: 1280})
            this.client = await this.currentPage.context().newCDPSession(this.currentPage);
            this.socket.emit('urlChanged', this.currentPage.url());
            await this.makeAndEmitScreenshot();
            await this.subscribeToScreencast();
        } else {
            logger.log('error', `${tabIndex} index out of range of pages`)
        }
    }
}
