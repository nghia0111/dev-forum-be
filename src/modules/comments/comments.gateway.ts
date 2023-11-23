// import { Controller, Post, Body, Put, Param, Delete, Req, BadRequestException } from '@nestjs/common';
// import { CommentsService } from './comments.service';
// import { CommentDto } from './dto/comment.dto';
// import { CommentValidator } from './comments.validator';
// import { Request } from 'express';

// @Controller('comments')
// export class CommentsController {
//   constructor(private readonly commentsService: CommentsService) {}

//   @Post(':postId')
//   create(
//     @Param('postId') postId: string,
//     @Body() createCommentDto: CommentDto,
//     @Req() req: Request,
//   ) {
//     const schema = CommentValidator;
//     const validateResult = schema.validate(createCommentDto);
//     if (validateResult.error)
//       throw new BadRequestException(validateResult.error.message);
//     this.commentsService.createComment(postId, createCommentDto, req.user);
//     return;
//   }

//   @Put(':id')
//   update(@Param('id') id: string, @Body() updateCommentDto: CommentDto) {
//     return this.commentsService.update(id, updateCommentDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.commentsService.remove(id);
//   }
// }

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
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ValidationErrorMessages } from 'src/common/constants';
import { Comment } from 'src/schemas/comments.schema';

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
    data: { postId: string; description: string },
  ) {
    const post = await this.postModel.findById(data.postId);
    if (!post)
      throw new NotFoundException(ValidationErrorMessages.POST_NOTFOUND);
    await this.commentModel.create({
      description: data.description,
      author: socket.data.userId,
      parent: null,
      post: data.postId,
    });

    const postData = await this.postService.getPostData(data.postId);
    this.server.emit('updatePost', postData);
  }
}
