import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('commentOnPost')
  handleCommentOnPost(
    socket: Socket,
    data: { postId: string; comment: string },
  ) {
    // Handle the comment on post logic, e.g., save to database
    console.log(`Received comment on post ${data.postId}: ${data.comment}`);

    // Broadcast the comment to all connected clients
    this.server.emit('commentOnPost', data);
  }
}
