import { Server, Socket } from 'socket.io';
import logger from "../logger";

export class SocketConnection {

    private readonly io : Server;

    public socket : Socket|null = null;

    public constructor(server: any){
        this.io = new Server(server);
        this.connect();
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
