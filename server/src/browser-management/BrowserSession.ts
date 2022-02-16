import { chromium, Page, Browser, CDPSession } from 'playwright';
import { uuid } from 'uuidv4';
import * as fs from 'fs';
import { Socket } from "socket.io";

import logger from '../logger';

export class BrowserSession {

    private browser: Browser | null = null;

    private currentPage : Page | null = null;

    private readonly id : string;

    private pages : Page[] = [];

    private client : CDPSession | null = null;

    private readonly socket : Socket;

    public constructor(socket: Socket){
        this.id = uuid();
        this.socket = socket;
    }

    public initialize = async(options: any) : Promise<void> => {
        // initialize the browser instance
        this.browser = <Browser>(await chromium.launch(
            {
                headless: false,
            })
        );
        //initialize page context
        const context = await this.browser.newContext();
        this.currentPage = await context.newPage();
        this.pages = this.pages.concat([this.currentPage]);
        //initialize CDP session
        this.client = await this.currentPage.context().newCDPSession(this.currentPage);
    };

    private startScreencast = async() : Promise<void> => {
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        await this.client.send('Page.startScreencast', { format: 'jpeg', quality: 75 });
        logger.log('info',`BrowserSession with id ${this.id} started with a screencasting.`);
    };

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

    public stopScreencast = async() : Promise<void> => {
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        await this.client.send('Page.stopScreencast');
        logger.log('info',`BrowserSession with id ${this.id} stopped with a screencasting.`);
    };

    public openPage = async(url: string) : Promise<void> =>{
        if (this.currentPage) {
            logger.log('debug',`Page ${url} opened`)
            await this.currentPage.goto(url);
            const image = await this.currentPage.screenshot();
            fs.writeFileSync('screenshot.png', image);
        } else {
            logger.log('warn','Page is not initialized');
        }
    };

    public clickOnCoordinates = async(x: number, y: number) => {
        if (!this.currentPage){
            return;
        }
        await this.currentPage.mouse.click(x, y);
        logger.log('info', `Clicked on position x:${x}, y:${y}`);
    };

    private emitScreenshot = (payload: any) : void => {
        const dataWithMimeType = ('data:image/jpeg;base64,').concat(payload);
        this.socket.emit('screencast', dataWithMimeType);
        logger.log('debug',`Screenshot emitted`);
    };
};
