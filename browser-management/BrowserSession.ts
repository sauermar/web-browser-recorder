import { chromium, Page, Browser } from 'playwright';
import { Protocol } from 'playwright/types/protocol';

export class BrowserSession {

    private browser : Browser|null = null;

    private async initialize() : Promise<void> {
        this.browser = <Browser>(await chromium.launch(
            process.env.CHROMIUM_PATH
                ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] }
                : {}
            )
        );

        this.close = (() => {
            if(this.browser){
                this.browser.close();
            }
            else{
                throw new Error('Cannot close nonexistent browser!');
            }
        });

        const sendScreencast = (params: Protocol.Page.screencastFramePayload) => {
            let buff = Buffer.from(params.data,'base64');
            this.rerep.send(buff);
        }

    }
};
