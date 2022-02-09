import { chromium, Page, Browser, CDPSession } from 'playwright';
import { uuid } from 'uuidv4';
import { Socket } from 'socket.io';
import { io } from '../server';
import * as fs from 'fs';
import logger from '../logger';

export class BrowserSession {

    private browser: Browser|null = null;

    private currentPage : Page|null = null;

    private readonly id : string;

    private pages : Page[] = [];

    private client : CDPSession|null = null;

    private socket : Socket|null = null;

    constructor(){
        this.id = uuid();
        io.on('connection', async (socket: Socket) => {
            logger.log('info',"Client connected");
            this.socket = socket;
            socket.on('disconnect', () => {
                logger.log('info', "Client disconnected");
            });
        });
    }

    private emitScreenshot = (payload: any) : void => {
        if (!this.socket) {
            logger.log('warn','socket is not connected');
            return;
        }
        const dataWithMimeType = ('data:image/jpeg;base64,').concat(payload);
        this.socket.emit('screencast', dataWithMimeType);
        logger.log('debug',`Screenshot emitted`);
    };

    public async initialize(options: any) : Promise<void> {
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

    private async startScreencast() : Promise<void> {
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        await this.client.send('Page.startScreencast', { format: 'jpeg', quality: 50 });
        logger.log('info',`BrowserSession with id ${this.id} started with a screencasting.`);
    };

    public async subscribeToScreencast() : Promise<void> {
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

    public async stopScreencast() : Promise<void> {
        if (!this.client) {
            logger.log('warn','client is not initialized');
            return;
        }
        await this.client.send('Page.stopScreencast');
        logger.log('info',`BrowserSession with id ${this.id} stopped with a screencasting.`);
    };

    public async openPage(url: string) : Promise<void>{
        if (this.currentPage) {
            logger.log('debug',`Page ${url} opened`)
            await this.currentPage.goto(url);
            const image = await this.currentPage.screenshot();
            fs.writeFileSync('screenshot.png', image);
            // this.emitScreenshot(image);
        } else {
            logger.log('warn','Page is not initialized');
        }
    };
};
