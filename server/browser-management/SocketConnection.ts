import { Server, Socket } from 'socket.io';
import logger from "../logger";

export class SocketConnection {

    private readonly io : Server;

    public socket : Socket|null = null;

    private browserSession: any;

    public constructor(server: any){
        this.io = new Server(server);
        this.connect();
    }

    public addBrowserSession = (br: any) => {
        this.browserSession = br;
    }

    private connect = () => {
        if (!this.io){
            logger.log('warn', 'socket connection wasn\'t yet initialized');
        }

        this.io.on('connection', async (socket: Socket) => {
            logger.log('info',"Client connected");
            this.socket = socket;
            socket.on('disconnect', () => {
                logger.log('info', "Client disconnected");
            });
            socket.on('interaction', (data) => {
                logger.log('debug', 'We are inside of interaction socket handler');
                (async () =>{
                    if (this.browserSession) {
                        await this.browserSession.clickOnCoordinates(data.coordinates.x, data.coordinates.y);
                    }
                })();
            })
        });
    }

    public emitScreenshot = (payload: any) : void => {
        if (!this.socket) {
            logger.log('warn','socket is not connected');
            return;
        }
        const dataWithMimeType = ('data:image/jpeg;base64,').concat(payload);
        this.socket.emit('screencast', dataWithMimeType);
        logger.log('debug',`Screenshot emitted`);
    };
};
