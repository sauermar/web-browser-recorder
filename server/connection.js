const messages = new Set();
const users = new Map();

const defaultUser = {
    id: 'anon',
    name: 'Anonymous',
};

const messageExpirationTimeMS = 5*60 * 1000;

class Connection {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;

        socket.on('getMessages', () => this.getMessages());
        socket.on('message', (value) => this.handleMessage(value));
        socket.on('disconnect', () => this.disconnect());
        socket.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
    }

    sendMessage(message) {
        this.io.sockets.emit('message', message);
    }

    getMessages() {
        messages.forEach((message) => this.sendMessage(message));
    }

    handleMessage(value) {
        const message = {
            user: users.get(this.socket) || defaultUser,
            value,
            time: Date.now()
        };

        messages.add(message);
        this.sendMessage(message);

        setTimeout(
            () => {
                messages.delete(message);
                this.io.sockets.emit('deleteMessage', message.id);
            },
            messageExpirationTimeMS,
        );
    }

    disconnect() {
        users.delete(this.socket);
    }
}

function chat(io) {
    io.on('connection', (socket) => {
        new Connection(io, socket);
    });
};

module.exports = chat;
