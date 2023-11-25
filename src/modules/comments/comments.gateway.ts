import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PostsService } from '../posts/posts.service';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/schemas/posts.schema';
import { Model } from 'mongoose';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ValidationErrorMessages } from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';
import { CommentValidator } from './comments.validator';

@WebSocketGateway()
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
    const token = socket.handshake.headers.authorization;
    try {
      //   const token = (authHeader as string).split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) throw new UnauthorizedException();
        socket.data.userId = decoded.sub;
      } else {
        socket.disconnect();
      }
    } catch (err) {
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('commentOnPost')
  async handleCommentOnPost(
    socket: Socket,
    data: { postId: string; parent?: string; description: string },
  ) {
    const post = await this.postModel.findById(data.postId);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    if (parent) {
      const comment = await this.commentModel.findById(data.parent);
      if (!comment)
        throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    }
    const schema = CommentValidator;
    const validateResult = schema.validate({ description: data.description });
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    await this.commentModel.create({
      description: data.description,
      author: socket.data.userId,
      parent: data.parent,
      post: data.postId,
    });

    const postData = await this.postService.getPostData(data.postId);
    this.server.emit('updatePost', postData);
  }

  @SubscribeMessage('updateComment')
  async handleUpdateComment(
    socket: Socket,
    data: { commentId: string; description: string },
  ) {
    const comment = await this.commentModel.findById(data.commentId);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    if (comment.author != socket.data.userId) throw new UnauthorizedException();
    const schema = CommentValidator;
    const validateResult = schema.validate({ description: data.description });
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    comment.description = data.description;
    await comment.save();

    const postData = await this.postService.getPostData(
      comment.post.toString(),
    );
    this.server.emit('updatePost', postData);
  }

  @SubscribeMessage('deleteComment')
  async handleDeleteComment(socket: Socket, data: { commentId: string }) {
    const comment = await this.commentModel.findById(data.commentId);
    if (!comment)
      throw new NotFoundException(ValidationErrorMessages.COMMENT_NOT_FOUND);
    if (comment.author != socket.data.userId) throw new UnauthorizedException();
    await this.commentModel.deleteMany({ parent: comment._id });
    await this.commentModel.findByIdAndDelete(data.commentId);

    const postData = await this.postService.getPostData(
      comment.post.toString(),
    );
    this.server.emit('updatePost', postData);
  }
}
