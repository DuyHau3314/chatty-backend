import { Server, Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export let socketIOPostHandler: Server;

export class SocketIOPostHandler {
  static instance: SocketIOPostHandler;
  private io: Server;

  constructor(io: Server) {
    if (!SocketIOPostHandler.instance) {
      SocketIOPostHandler.instance = this;
    }
    this.io = io;
    socketIOPostHandler = io;
    return SocketIOPostHandler.instance;
  }

  public listen(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.io.on('connection', (socket: Socket) => {
      console.log('Post socketio handler');
    });
  }
}
