import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import {
  NotificationTypes,
  ValidationErrorMessages,
  generateNotiMessage,
} from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { Notification } from 'src/schemas/notifications.schema';
import { Post } from 'src/schemas/posts.schema';
import { User } from 'src/schemas/users.schema';
import { AgoraService } from '../agora/agora.service';
import { PostsService } from '../posts/posts.service';

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private connectedClients: Map<string, Socket>;

  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly agoraService: AgoraService,
    private readonly postService: PostsService,
  ) {
    this.connectedClients = new Map();
  }

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) socket.data.userId = undefined;
        socket.data.userId = decoded.sub;
        this.connectedClients.set(socket.data.userId, socket);
      } else {
        socket.data.userId = undefined;
      }
    } catch (err) {
      socket.data.userId = undefined;
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.connectedClients.delete(socket.id);
  }

  // events relating to comment

  @SubscribeMessage('joinPostRoom')
  async handleJoinPostRoom(socket: Socket, data: { postId: string }) {
    const post = await this.postModel.findById(data.postId);
    if (!post) {
      throw new WsException(ValidationErrorMessages.POST_NOT_FOUND);
    }
    // Join the room based on the postId
    socket.join(data.postId);
  }

  @SubscribeMessage('leavePostRoom')
  async handleLeavePostRoom(socket: Socket, data: { postId: string }) {
    const post = await this.postModel.findById(data.postId);
    if (!post) {
      throw new WsException(ValidationErrorMessages.POST_NOT_FOUND);
    }
    // Join the room based on the postId
    socket.leave(data.postId);
  }

  //events relating to video call
  @SubscribeMessage('createMeeting')
  async handleCreateMeeting(socket: Socket, data: { guestId: string }) {
    if (!socket.data.userId) {
      throw new WsException(ValidationErrorMessages.UNAUTHORIZED);
    }
    const tokenData = await this.agoraService.generateRtcToken(
      socket.data.userId,
    );
    socket.emit('generateToken', tokenData);
    const sender = await this.userModel.findById(socket.data.userId);
    const guest = this.connectedClients.get(data.guestId.toString());
    let notification = await this.notificationModel.create({
      sender: sender._id,
      receiver: data.guestId,
      type: NotificationTypes.CALL,
      hasSeen: false,
      message: generateNotiMessage(NotificationTypes.CALL, sender.displayName),
      extraData: { ...tokenData },
    });
    const leanedNoti = notification.toObject();
    if (guest) {
      guest.emit('notification', {
        senderAvatar: sender.avatar,
        ...leanedNoti,
      });
    }
  }

  async createNotification(
    senderId: string,
    receiverId: any,
    type: string,
    message: string,
    senderAvatar: string,
    extraData?: any
  ) {
    let notification = await this.notificationModel.create({
      sender: senderId,
      receiver: receiverId,
      type: type,
      hasSeen: false,
      message: message,
      extraData: extraData,
    });
    const leanedNoti = notification.toObject();
    const notifiedSocket = this.connectedClients.get(receiverId.toString());
    if (notifiedSocket) {
      notifiedSocket.emit('notification', {
        senderAvatar: senderAvatar,
        ...leanedNoti,
      });
    }
  }
}
