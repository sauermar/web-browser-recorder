import {
    Page,
    Browser,
    CDPSession,
} from 'playwright';
import { Socket } from "socket.io";

import logger from '../../logger';
import { RemoteBrowserOptions } from "../../interfaces/Input";
import { WorkflowGenerator } from "../../workflow-management/generator";
import Interpreter, { WorkflowFile } from "@wbr-project/wbr-interpret";
import { saveFile } from "../../workflow-management/storage";
import fs from "fs";

export class RemoteBrowser {

    private browser: Browser | null = null;

    private pages : Page[] = [];

    private client : CDPSession | null | undefined = null;

    private socket : Socket;

    public currentPage : Page | null | undefined = null;

    public generator: WorkflowGenerator | null = null;

    public interpreter: Interpreter | null = null;

    private interpretationIsPaused: boolean = false;

    private interpretationResume: (() => void) | null = null;

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
        this.socket.on('pause', () => {
            this.interpretationIsPaused = true;
        });
        this.socket.on('resume', () => {
            this.interpretationIsPaused = false;
            if (this.interpretationResume) {
                this.interpretationResume();
            } else {
                logger.log('debug',"Resume called but no resume function is set");
            }
        });
        this.socket.on('step', () => {
            if (this.interpretationResume) {
                this.interpretationResume();
            } else {
                logger.log('debug', "Step called but no resume function is set");
            }
        });
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

    public updateSocket = (socket: Socket) : void => {
        this.socket = socket;
        this.generator?.updateSocket(socket);
    };

    public makeAndEmitScreenshot = async() : Promise<void> => {
        const screenshot = await this.currentPage?.screenshot();
        if (screenshot) {
            this.emitScreenshot(screenshot.toString('base64'));
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
            const workflow = await this.generator.getWorkflowFile();
            // save current interpreted workflow for debugging
            await saveFile( '../workflow.json', JSON.stringify(workflow, null, 2));
            await this.initializeNewPage();
            if (this.currentPage) {
                const options = {
                    serializableCallback: console.log,
                    binaryCallback: (data: string, mimetype: string) => fs.writeFileSync("output", data)
                }

                const interpreter = new Interpreter(workflow, options);
                this.interpreter = interpreter;

                  interpreter.on('flag', async (page, resume) => {
                    if (this.interpretationIsPaused) {
                        this.interpretationResume = resume;
                        logger.log('debug',`Paused inside of flag: ${page.url()}`);
                        console.log(`Is paused`);
                        this.currentPage = page;
                        this.generator!.page= page;
                    } else {
                        resume();
                    }
                  })

                if (this.currentPage) {
                   const result =  await interpreter.run(
                      this.currentPage
                    );
                    logger.log('debug',`Interpretation finished`);
                    if (this.interpretationIsPaused) {
                        this.interpretationIsPaused = false;
                        this.socket.emit('finished');
                    }
                }
                this.interpreter = null;
                this.interpretationResume = null;
            } else {
                logger.log('error', 'Could not get a new page, returned undefined');
            }
        } else {
            logger.log('error', 'Generator is not initialized');
        }
    };

    public stopCurrentInterpretation = async () : Promise<void> => {
        if (this.interpreter) {
            logger.log('info', 'Stopping the interpretation.');
            await this.interpreter.stop();
            this.interpreter = null;
            this.currentPage = null;
        } else {
            logger.log('error', 'Cannot stop: No active interpretation.');
        }
    };

};
