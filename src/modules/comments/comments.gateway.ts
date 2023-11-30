import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PostsService } from '../posts/posts.service';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/schemas/posts.schema';
import { Model } from 'mongoose';
import { ValidationErrorMessages } from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { CommentValidator } from './comments.validator';

@WebSocketGateway({ cors: true })
export class CommentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly postService: PostsService,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) socket.data.userId = undefined;
        socket.data.userId = decoded.sub;
      } else {
        socket.data.userId = undefined;
      }
    } catch (err) {
      socket.data.userId = undefined;;
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('joinPostRoom')
  async handleJoinPostRoom(socket: Socket, data: { postId: string }) {
    const post = await this.postModel.findById(data.postId);
    if (!post) {
      throw new WsException(ValidationErrorMessages.POST_NOT_FOUND);
    }
    // Join the room based on the postId
    socket.join(data.postId);
  }

  @SubscribeMessage('commentOnPost')
  async handleCommentOnPost(
    socket: Socket,
    data: { postId: string; parent?: string; description: string },
  ) {
    if(!socket.data.userId) throw new WsException(ValidationErrorMessages.UNAUTHENTICATED)
    const post = await this.postModel.findById(data.postId);
    if (!post)
      throw new WsException(ValidationErrorMessages.POST_NOT_FOUND);
    if (data.parent) {
      const comment = await this.commentModel.findById(data.parent);
      if (!comment)
        throw new WsException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    }
    const schema = CommentValidator;
    const validateResult = schema.validate({ description: data.description });
    if (validateResult.error)
      throw new WsException(validateResult.error.message);
    await this.commentModel.create({
      description: data.description,
      author: socket.data.userId,
      parent: data.parent,
      post: data.postId,
    });

    const postData = await this.postService.getPostData(data.postId);
    this.server.to(data.postId).emit('updatePost', postData);
  }

  @SubscribeMessage('updateComment')
  async handleUpdateComment(
    socket: Socket,
    data: { commentId: string; description: string },
  ) {
    if (!socket.data.userId) throw new WsException(ValidationErrorMessages.UNAUTHORIZED);
    const comment = await this.commentModel.findById(data.commentId);
    if (!comment)
      throw new WsException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    if (comment.author != socket.data.userId) throw new WsException(ValidationErrorMessages.UNAUTHORIZED);
    const schema = CommentValidator;
    const validateResult = schema.validate({ description: data.description });
    if (validateResult.error)
      throw new WsException(validateResult.error.message);
    comment.description = data.description;
    await comment.save();

    const postData = await this.postService.getPostData(
      comment.post.toString(),
    );
    this.server.to(comment.post.toString()).emit('updatePost', postData);
  }

  @SubscribeMessage('deleteComment')
  async handleDeleteComment(socket: Socket, data: { commentId: string }) {
    if (!socket.data.userId) throw new WsException(ValidationErrorMessages.UNAUTHORIZED);
    const comment = await this.commentModel.findById(data.commentId);
    const postId = comment.post.toString();
    if (!comment)
      throw new WsException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    if (comment.author != socket.data.userId) throw new WsException(ValidationErrorMessages.UNAUTHORIZED);
    await this.commentModel.deleteMany({ parent: comment._id });
    await this.commentModel.findByIdAndDelete(data.commentId);

    const postData = await this.postService.getPostData(
      comment.post.toString(),
    );
    this.server.to(postId).emit('updatePost', postData);
  }
}
